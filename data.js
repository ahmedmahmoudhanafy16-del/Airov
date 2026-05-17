// AIROV - Global Site Data (Simple CMS & Mock Backend)

const siteData = {
    "brand": {
        "name": "AIROV",
        "currency": "EGP",
        "social": {
            "instagram": "https://www.instagram.com/airov__/",
            "order_dm": "https://ig.me/m/airov__"
        }
    },
    "hero": {
        "slogan": "Live Life Dynamically",
        "button_text": "Discover C.1",
        "button_link": "#collections",
        "image_path": "assets/hero.png"
    },
    "philosophy": {
        "established": "EST. 2024",
        "title": "Engineered Movement.",
        "description": "We believe in the intersection of performance and aesthetic. AIROV is built for the individual who moves through the city with purpose, requiring gear that transitions as fluidly as they do.",
        "image_path": "assets/black-jacket.png"
    },
    "products": [
        {
            "id": "spectrum-hoodie",
            "name": "Spectrum Hoodie",
            "category": "hoodies",
            "colors": [
                {"name": "Rose", "hex": "#DCA7A7"},
                {"name": "Onyx", "hex": "#111111"},
                {"name": "Ghost", "hex": "#f0f0f0"}
            ],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "stock": {
                "S": 5, "M": 12, "L": 0, "XL": 4, "XXL": 0
            },
            "price": 1850,
            "sale_price": null,
            "image": "assets/pink-hoodie.png",
            "gallery": [
                "assets/pink-hoodie.png",
                "assets/hero.png",
                "assets/black-jacket.png"
            ],
            "description": "The Spectrum Hoodie features an oversized fit built for urban utility and unmatched comfort. Heavyweight cotton blend with a dropped shoulder design.",
            "details": [
                "450 GSM Heavyweight Cotton",
                "Dropped shoulder silhouette",
                "Double-lined hood",
                "Kangaroo pocket"
            ],
            "care": "Machine wash cold. Do not tumble dry. Iron on reverse.",
            "badges": ["new", "bestseller"],
            "sales_count": 145,
            "reviews": [
                { "name": "Omar K.", "city": "Cairo", "rating": 5, "date": "12 May 2026", "text": "Incredible quality. Fits perfectly oversized.", "verified": true },
                { "name": "Ali H.", "city": "Alexandria", "rating": 4, "date": "08 May 2026", "text": "Very heavy and warm, love the rose color.", "verified": true }
            ]
        },
        {
            "id": "breathe-windbreaker",
            "name": "Breathe Windbreaker",
            "category": "jackets",
            "colors": [
                {"name": "Onyx", "hex": "#111111"}
            ],
            "sizes": ["S", "M", "L", "XL"],
            "stock": {
                "S": 2, "M": 5, "L": 8, "XL": 1
            },
            "price": 2400,
            "sale_price": 1999,
            "image": "assets/black-jacket.png",
            "gallery": [
                "assets/black-jacket.png",
                "assets/hero.png",
                "assets/black-jacket.png"
            ],
            "description": "Engineered for the elements. The Breathe Windbreaker offers lightweight protection with a sleek, minimalist silhouette.",
            "details": [
                "Water-resistant shell",
                "Breathable mesh lining",
                "Adjustable bungee hem",
                "Hidden zip pockets"
            ],
            "care": "Wipe clean with a damp cloth. Do not iron.",
            "badges": ["sale"],
            "sales_count": 89,
            "reviews": [
                { "name": "Karim S.", "city": "Giza", "rating": 5, "date": "14 April 2026", "text": "Perfect for late night runs. Very sleek.", "verified": true }
            ]
        },
        {
            "id": "essential-tee",
            "name": "Essential Tee",
            "category": "tees",
            "colors": [
                {"name": "Ghost", "hex": "#f0f0f0"},
                {"name": "Onyx", "hex": "#111111"}
            ],
            "sizes": ["S", "M", "L", "XL", "XXL"],
            "stock": {
                "S": 10, "M": 20, "L": 15, "XL": 5, "XXL": 2
            },
            "price": 850,
            "sale_price": null,
            "image": "assets/pink-hoodie.png",
            "gallery": [
                "assets/pink-hoodie.png",
                "assets/hero.png",
                "assets/pink-hoodie.png"
            ],
            "description": "Your everyday foundation. Premium midweight cotton cut for a perfect relaxed fit.",
            "details": [
                "220 GSM Premium Cotton",
                "Relaxed fit",
                "Ribbed crewneck",
                "Pre-shrunk"
            ],
            "care": "Machine wash cold with like colors.",
            "badges": ["trending"],
            "sales_count": 312,
            "reviews": [
                { "name": "Youssef N.", "city": "Cairo", "rating": 5, "date": "02 May 2026", "text": "The best basic tee I own. Ordering 3 more.", "verified": true },
                { "name": "Tarek M.", "city": "Mansoura", "rating": 4, "date": "28 April 2026", "text": "Great fit, simple design.", "verified": true }
            ]
        },
        {
            "id": "c1-cargo-pants",
            "name": "C.1 Cargo Pants",
            "category": "bottoms",
            "colors": [
                {"name": "Onyx", "hex": "#111111"},
                {"name": "Olive", "hex": "#4b5320"}
            ],
            "sizes": ["S", "M", "L", "XL"],
            "stock": {
                "S": 0, "M": 3, "L": 4, "XL": 0
            },
            "price": 1600,
            "sale_price": null,
            "image": "assets/hero.png",
            "gallery": [
                "assets/hero.png",
                "assets/black-jacket.png",
                "assets/hero.png"
            ],
            "description": "Tactical utility meets streetwear. Featuring 6 functional pockets and an adjustable ankle cinch.",
            "details": [
                "Cotton-nylon blend",
                "Relaxed straight fit",
                "Cargo pockets with snap closures",
                "Adjustable drawcord hems"
            ],
            "care": "Machine wash cold. Line dry.",
            "badges": ["new", "trending"],
            "sales_count": 210,
            "reviews": [
                { "name": "Seif E.", "city": "Cairo", "rating": 5, "date": "10 May 2026", "text": "The fit on these is crazy. Love the olive color.", "verified": true }
            ]
        }
    ],
    "lookbook": [
        "assets/hero.png",
        "assets/black-jacket.png",
        "assets/pink-hoodie.png"
    ]
};
