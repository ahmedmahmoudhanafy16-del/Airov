// AIROV - Global Site Data (Simple CMS)
// Edit this file to update the website content without touching HTML or CSS.

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
        "image_path": "assets/hero.png" // Can be a video or image
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
            "price": 1850,
            "image": "assets/pink-hoodie.png",
            "description": "The Spectrum Hoodie features an oversized fit built for urban utility and unmatched comfort. Heavyweight cotton blend with a dropped shoulder design.",
            "in_stock": true
        },
        {
            "id": "breathe-windbreaker",
            "name": "Breathe Windbreaker",
            "category": "jackets",
            "colors": [
                {"name": "Onyx", "hex": "#111111"}
            ],
            "price": 2400,
            "image": "assets/black-jacket.png",
            "description": "Engineered for the elements. The Breathe Windbreaker offers lightweight protection with a sleek, minimalist silhouette.",
            "in_stock": true
        },
        {
            "id": "essential-tee",
            "name": "Essential Tee",
            "category": "tees",
            "colors": [
                {"name": "Ghost", "hex": "#f0f0f0"},
                {"name": "Onyx", "hex": "#111111"}
            ],
            "price": 850,
            "image": "assets/pink-hoodie.png",
            "description": "Your everyday foundation. Premium midweight cotton cut for a perfect relaxed fit.",
            "in_stock": true
        }
    ],
    "lookbook": [
        "assets/hero.png",
        "assets/black-jacket.png",
        "assets/pink-hoodie.png"
    ]
};
