#!/bin/bash

# Configuration
DOMAIN="https://yourdomain.com"
CONSUMER_KEY="ck_your_consumer_key_here"
CONSUMER_SECRET="cs_your_consumer_secret_here"

# API endpoints
CATEGORIES_ENDPOINT="/wp-json/wc/v3/products/categories"
ATTRIBUTES_ENDPOINT="/wp-json/wc/v3/products/attributes"
PRODUCTS_ENDPOINT="/wp-json/wc/v3/products"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Creating WooCommerce Product with Variants"
echo "=========================================="

# 1. Create Product Brand (Category)
echo -e "\n${GREEN}1. Creating Product Brand...${NC}"
BRAND_RESPONSE=$(curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike",
    "slug": "nike",
    "description": "Official Nike products",
    "display": "default"
  }' \
  "$DOMAIN$CATEGORIES_ENDPOINT")

BRAND_ID=$(echo $BRAND_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Brand created with ID: $BRAND_ID"

# 2. Create Size Attribute
echo -e "\n${GREEN}2. Creating Size Attribute...${NC}"
SIZE_ATTR_RESPONSE=$(curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Size",
    "slug": "pa_size",
    "type": "select",
    "order_by": "menu_order",
    "has_archives": true
  }' \
  "$DOMAIN$ATTRIBUTES_ENDPOINT")

SIZE_ATTR_ID=$(echo $SIZE_ATTR_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Size Attribute ID: $SIZE_ATTR_ID"

# 3. Create Size Attribute Terms
echo -e "\n${GREEN}3. Creating Size Attribute Terms...${NC}"
curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name": "Small"}' \
  "$DOMAIN/wp-json/wc/v3/products/attributes/$SIZE_ATTR_ID/terms"

curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name": "Medium"}' \
  "$DOMAIN/wp-json/wc/v3/products/attributes/$SIZE_ATTR_ID/terms"

echo "Size terms (Small, Medium) created"

# 4. Create Color Attribute
echo -e "\n${GREEN}4. Creating Color Attribute...${NC}"
COLOR_ATTR_RESPONSE=$(curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Color",
    "slug": "pa_color",
    "type": "select",
    "order_by": "menu_order",
    "has_archives": true
  }' \
  "$DOMAIN$ATTRIBUTES_ENDPOINT")

COLOR_ATTR_ID=$(echo $COLOR_ATTR_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Color Attribute ID: $COLOR_ATTR_ID"

# 5. Create Color Attribute Terms
echo -e "\n${GREEN}5. Creating Color Attribute Terms...${NC}"
curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name": "Red"}' \
  "$DOMAIN/wp-json/wc/v3/products/attributes/$COLOR_ATTR_ID/terms"

curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"name": "Blue"}' \
  "$DOMAIN/wp-json/wc/v3/products/attributes/$COLOR_ATTR_ID/terms"

echo "Color terms (Red, Blue) created"

# 6. Create the Variable Product
echo -e "\n${GREEN}6. Creating Variable Product...${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Nike Running Shoes\",
    \"type\": \"variable\",
    \"regular_price\": \"79.99\",
    \"description\": \"High-quality Nike running shoes with excellent cushioning.\",
    \"short_description\": \"Premium running shoes\",
    \"categories\": [
      {
        \"id\": $BRAND_ID
      }
    ],
    \"images\": [
      {
        \"src\": \"https://example.com/images/nike-shoes-main.jpg\",
        \"name\": \"Nike Running Shoes\"
      }
    ],
    \"attributes\": [
      {
        \"id\": $SIZE_ATTR_ID,
        \"name\": \"Size\",
        \"position\": 0,
        \"visible\": true,
        \"variation\": true,
        \"options\": [\"Small\", \"Medium\"]
      },
      {
        \"id\": $COLOR_ATTR_ID,
        \"name\": \"Color\",
        \"position\": 1,
        \"visible\": true,
        \"variation\": true,
        \"options\": [\"Red\", \"Blue\"]
      }
    ]
  }" \
  "$DOMAIN$PRODUCTS_ENDPOINT")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo "Variable Product created with ID: $PRODUCT_ID"

# 7. Create Variations
echo -e "\n${GREEN}7. Creating Product Variations...${NC}"

# Variation 1: Small, Red
echo "Creating Variation 1: Small, Red"
curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "regular_price": "79.99",
    "sku": "NIKE-RUN-RED-SM",
    "stock_quantity": 50,
    "attributes": [
      {
        "name": "Size",
        "option": "Small"
      },
      {
        "name": "Color",
        "option": "Red"
      }
    ],
    "image": {
      "src": "https://example.com/images/nike-red-small.jpg"
    }
  }' \
  "$DOMAIN/wp-json/wc/v3/products/$PRODUCT_ID/variations"

# Variation 2: Medium, Blue
echo "Creating Variation 2: Medium, Blue"
curl -s -X POST \
  -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "regular_price": "79.99",
    "sku": "NIKE-RUN-BLUE-MD",
    "stock_quantity": 35,
    "attributes": [
      {
        "name": "Size",
        "option": "Medium"
      },
      {
        "name": "Color",
        "option": "Blue"
      }
    ],
    "image": {
      "src": "https://example.com/images/nike-blue-medium.jpg"
    }
  }' \
  "$DOMAIN/wp-json/wc/v3/products/$PRODUCT_ID/variations"

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ Setup Completed Successfully!${NC}"
echo -e "${GREEN}Product ID: $PRODUCT_ID${NC}"
echo -e "${GREEN}Brand ID: $BRAND_ID${NC}"
echo -e "${GREEN}Two variations created:${NC}"
echo -e "${GREEN}1. Small, Red (SKU: NIKE-RUN-RED-SM)${NC}"
echo -e "${GREEN}2. Medium, Blue (SKU: NIKE-RUN-BLUE-MD)${NC}"
echo -e "${GREEN}==========================================${NC}"