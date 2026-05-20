import os
import re
import json
import logging
from typing import List, Optional
from datetime import datetime, timedelta
import httpx
from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
from passlib.hash import bcrypt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GrocifyFastAPI")

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/grocery_inventory")
JWT_SECRET = os.getenv("JWT_SECRET", "grocery_system_ultra_secret_key_12345")
PORT = int(os.getenv("PORT", 5000))

app = FastAPI(title="Grocify FastAPI Backend", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB async client
db_client = None
db = None

# Custom JSON helper to convert ObjectId to string representation
def clean_mongo_doc(doc):
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc

# Seeding engine on startup
@app.on_event("startup")
async def startup_db_client():
    global db_client, db
    logger.info("Connecting to MongoDB...")
    db_client = AsyncIOMotorClient(MONGO_URI)
    db = db_client.get_database()
    logger.info("Connected to MongoDB successfully!")
    
    # Auto db seed
    try:
        count = await db.items.count_documents({})
        if count == 0:
            logger.info("🌱 Database is empty. Seeding initial grocery items...")
            inventory_path = os.path.join(os.path.dirname(__file__), "..", "backend", "inventory.json")
            if os.path.exists(inventory_path):
                with open(inventory_path, "r", encoding="utf-8") as f:
                    seed_data = json.load(f)
                
                # Prepare dates and standard fields
                for item in seed_data:
                    # Convert expiryDate string to datetime
                    if "expiryDate" in item and item["expiryDate"]:
                        try:
                            item["expiryDate"] = datetime.fromisoformat(item["expiryDate"].replace("Z", "+00:00"))
                        except Exception:
                            try:
                                item["expiryDate"] = datetime.strptime(item["expiryDate"], "%Y-%m-%d")
                            except Exception:
                                pass
                    item["createdAt"] = datetime.utcnow()
                    item["updatedAt"] = datetime.utcnow()
                
                await db.items.insert_many(seed_data)
                logger.info(f"✅ Database successfully seeded with {len(seed_data)} items!")
            else:
                logger.warning("⚠️ inventory.json not found. Skipping seeding.")
        else:
            logger.info(f"📈 Database already contains {count} items. Seeding skipped.")
    except Exception as e:
        logger.error(f"❌ Error seeding database: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    global db_client
    if db_client:
        db_client.close()
        logger.info("MongoDB connection closed.")

# Helpers for Auth / JWT
def generate_token(user_id: str, email: str) -> str:
    payload = {
        "id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# Schemas
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class ItemCreate(BaseModel):
    sku: Optional[str] = None
    name: str
    category: str
    price: float
    stock: int
    minStock: int = Field(default=0)
    unit: str
    supplier: str
    expiryDate: Optional[str] = None
    imageUrl: Optional[str] = None

class ItemUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    minStock: Optional[int] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    expiryDate: Optional[str] = None
    imageUrl: Optional[str] = None

def extract_direct_image_url(url: str) -> str:
    if not url:
        return url
    try:
        # Match search engines redirects to retrieve the high resolution source directly
        if "search.yahoo.com" in url:
            match = re.search(r"imgurl=([^&]+)", url)
            if match:
                decoded = match.group(1)
                return decoded if decoded.startswith("http") else f"https://{decoded}"
        if "google" in url and "imgres" in url:
            match = re.search(r"imgurl=([^&]+)", url)
            if match:
                return match.group(1)
        if "bing.com" in url and "images" in url:
            match = re.search(r"imgurl=([^&]+)", url)
            if match:
                return match.group(1)
    except Exception:
        pass
    return url

async def send_low_stock_email(item_name: str, sku: str, stock: int, min_stock: int):
    # Simulate high-performance non-blocking Ethereal / Local SMTP alert mailing
    logger.info(f"\n--- LOW STOCK ALERT TRIGGERED (FASTAPI) ---")
    logger.info(f"Email Sent for: {item_name} ({sku})")
    logger.info(f"Current Stock: {stock} | Threshold: {min_stock}")
    logger.info(f"---------------------------------------------\n")

# Routes
@app.get("/")
async def root():
    return {
        "message": "Welcome to the Grocery Inventory System REST API (FastAPI Optimized)",
        "endpoints": {
            "items": "/api/items",
            "stats": "/api/items/stats",
            "lowStock": "/api/items/low-stock"
        }
    }

# --- AUTH ROUTER ---
@app.post("/api/auth/signup")
async def signup(body: SignupRequest):
    email_clean = body.email.strip().lower()
    existing = await db.users.find_one({"email": email_clean})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    
    hashed_pwd = bcrypt.hash(body.password)
    new_user = {
        "name": body.name.strip(),
        "email": email_clean,
        "password": hashed_pwd,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    result = await db.users.insert_one(new_user)
    saved_user = await db.users.find_one({"_id": result.inserted_id})
    token = generate_token(str(saved_user["_id"]), saved_user["email"])
    
    return {
        "token": token,
        "user": {
            "id": str(saved_user["_id"]),
            "name": saved_user["name"],
            "email": saved_user["email"],
            "avatar": saved_user.get("avatar", "")
        }
    }

@app.post("/api/auth/login")
async def login(body: LoginRequest):
    email_clean = body.email.strip().lower()
    user = await db.users.find_one({"email": email_clean})
    if not user or not user.get("password"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not bcrypt.verify(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = generate_token(str(user["_id"]), user["email"])
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar", "")
        }
    }

@app.post("/api/auth/google")
async def google_login(body: GoogleLoginRequest):
    if not body.credential:
        raise HTTPException(status_code=400, detail="Google credential token is missing")
    
    async with httpx.AsyncClient() as client:
        res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={body.credential}")
        payload = res.json()
        
    if payload.get("error_description") or not payload.get("email"):
        raise HTTPException(status_code=400, detail="Invalid Google credentials token")
        
    email = payload["email"].lower()
    name = payload.get("name", "Google User")
    picture = payload.get("picture", "")
    google_id = payload.get("sub")
    
    user = await db.users.find_one({"email": email})
    if user:
        modified = False
        updates = {}
        if not user.get("googleId"):
            updates["googleId"] = google_id
            modified = True
        if not user.get("avatar") and picture:
            updates["avatar"] = picture
            modified = True
        if modified:
            await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
            user = await db.users.find_one({"_id": user["_id"]})
    else:
        new_user = {
            "name": name,
            "email": email,
            "googleId": google_id,
            "avatar": picture,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        res_insert = await db.users.insert_one(new_user)
        user = await db.users.find_one({"_id": res_insert.inserted_id})
        
    token = generate_token(str(user["_id"]), user["email"])
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar", "")
        }
    }

# --- ITEMS ROUTER ---
@app.get("/api/items")
async def get_items(search: Optional[str] = None, category: Optional[str] = None, sortBy: Optional[str] = None):
    query = {}
    
    if category and category != "All":
        query["category"] = category
        
    if search:
        search_regex = re.compile(search, re.IGNORECASE)
        query["$or"] = [
            {"name": search_regex},
            {"sku": search_regex},
            {"supplier": search_regex}
        ]
        
    cursor = db.items.find(query)
    
    # Sorting
    if sortBy:
        field, order = sortBy.split("_") if "_" in sortBy else ("createdAt", "desc")
        sort_order = -1 if order == "desc" else 1
        
        if field in ["name", "price", "stock"]:
            cursor = cursor.sort(field, sort_order)
        else:
            cursor = cursor.sort("createdAt", -1)
    else:
        cursor = cursor.sort("createdAt", -1)
        
    results = await cursor.to_list(length=1000)
    return [clean_mongo_doc(r) for r in results]

@app.get("/api/items/stats")
async def get_stats():
    total_items = await db.items.count_documents({})
    
    # Value aggregations
    value_agg = await db.items.aggregate([
        {"$project": {"totalValue": {"$multiply": ["$price", "$stock"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$totalValue"}}}
    ]).to_list(length=1)
    total_value = value_agg[0]["total"] if value_agg else 0
    
    # Low stock items count (stock <= minStock)
    low_stock_count = await db.items.count_documents({"$expr": {"$lte": ["$stock", "$minStock"]}})
    
    # Out of stock count
    out_of_stock_count = await db.items.count_documents({"stock": 0})
    
    # Category statistics aggregation
    cat_agg = await db.items.aggregate([
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1},
            "value": {"$sum": {"$multiply": ["$price", "$stock"]}}
        }},
        {"$project": {
            "category": "$_id",
            "count": 1,
            "value": {"$round": ["$value", 2]},
            "_id": 0
        }},
        {"$sort": {"count": -1}}
    ]).to_list(length=100)
    
    return {
        "totalItems": total_items,
        "totalValue": round(total_value, 2),
        "lowStockCount": low_stock_count,
        "outOfStockCount": out_of_stock_count,
        "categoryStats": cat_agg
    }

@app.get("/api/items/low-stock")
async def get_low_stock():
    cursor = db.items.find({"$expr": {"$lte": ["$stock", "$minStock"]}}).sort("stock", 1)
    results = await cursor.to_list(length=1000)
    return [clean_mongo_doc(r) for r in results]

@app.get("/api/items/{item_id}")
async def get_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
    item = await db.items.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return clean_mongo_doc(item)

@app.post("/api/items", status_code=201)
async def create_item(item: ItemCreate):
    item_data = item.dict()
    if item_data.get("imageUrl"):
        item_data["imageUrl"] = extract_direct_image_url(item_data["imageUrl"].strip())
        
    # Auto SKU generator if not specified
    if not item_data.get("sku"):
        prefix = (item_data.get("category") or "GEN")[:3].upper()
        import random
        num = random.randint(1000, 9999)
        item_data["sku"] = f"{prefix}-{num}"
        
    # Expiry date parsing
    if item_data.get("expiryDate"):
        try:
            item_data["expiryDate"] = datetime.strptime(item_data["expiryDate"].split("T")[0], "%Y-%m-%d")
        except Exception:
            item_data["expiryDate"] = None
    else:
        item_data["expiryDate"] = None
        
    item_data["createdAt"] = datetime.utcnow()
    item_data["updatedAt"] = datetime.utcnow()
    
    # Check duplicate SKU
    dupe = await db.items.find_one({"sku": item_data["sku"]})
    if dupe:
        raise HTTPException(status_code=400, detail="Duplicate SKU error. The SKU must be unique.")
        
    result = await db.items.insert_one(item_data)
    saved = await db.items.find_one({"_id": result.inserted_id})
    return clean_mongo_doc(saved)

@app.put("/api/items/{item_id}")
async def update_item(item_id: str, item: ItemUpdate):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
        
    existing = await db.items.find_one({"_id": ObjectId(item_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = {k: v for k, v in item.dict().items() if v is not None}
    
    # Clean image URLs
    if "imageUrl" in update_data:
        url = update_data["imageUrl"]
        if url == "" or url.strip() == "":
            update_data["imageUrl"] = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
        else:
            update_data["imageUrl"] = extract_direct_image_url(url.strip())
            
    # Clean Expiry Date
    if "expiryDate" in update_data:
        if update_data["expiryDate"]:
            try:
                update_data["expiryDate"] = datetime.strptime(update_data["expiryDate"].split("T")[0], "%Y-%m-%d")
            except Exception:
                update_data["expiryDate"] = None
        else:
            update_data["expiryDate"] = None
            
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    updated = await db.items.find_one({"_id": ObjectId(item_id)})
    
    # Check low stock notification trigger
    if updated.get("stock", 0) <= updated.get("minStock", 0):
        await send_low_stock_email(updated["name"], updated.get("sku", ""), updated.get("stock", 0), updated.get("minStock", 0))
        
    return clean_mongo_doc(updated)

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID format")
    existing = await db.items.find_one({"_id": ObjectId(item_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.items.delete_one({"_id": ObjectId(item_id)})
    return {"message": "Item deleted successfully", "id": item_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
