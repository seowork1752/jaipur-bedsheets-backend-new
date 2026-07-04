import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import { Category } from '../models/Category';

dotenv.config();

const categories = [
  {
    name: 'Cotton Bedsheets',
    slug: 'cotton-bedsheets',
    description: 'Premium 100% cotton bedsheets for maximum comfort',
  },
  {
    name: 'Hand Block Print',
    slug: 'hand-block-print',
    description: 'Traditional Jaipur hand-printed bedsheets',
  },
  {
    name: 'Sanganeri Print',
    slug: 'sanganeri-print',
    description: 'Authentic Sanganeri patterns on premium fabrics',
  },
  {
    name: 'Premium Collection',
    slug: 'premium-collection',
    description: 'Luxury bedsheets for discerning customers',
  },
  {
    name: 'Festival Collection',
    slug: 'festival-collection',
    description: 'Special designs for festivals and celebrations',
  },
];

const products = [
  {
    name: 'Royal Blue Cotton Bedsheet - King Size',
    slug: 'royal-blue-cotton-bedsheet-king',
    description: 'Experience luxury with our premium 100% cotton royal blue bedsheet. Soft, breathable, and durable.',
    shortDescription: 'Premium royal blue cotton bedsheet for king size beds',
    collection: 'Premium Collection',
    price: 2499,
    discountPrice: 1899,
    discount: 24,
    stock: 150,
    featured: true,
    bestseller: true,
    images: {
      front: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      back: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      folded: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800',
      closeup: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      gallery: [],
    },
    specifications: {
      fabric: '100% Cotton',
      weave: 'Percale',
      thread_count: 400,
      gsm: 200,
      washcare: ['Machine wash cold', 'Gentle cycle', 'No bleach'],
      care_instructions: 'Dry on low heat. Iron on cotton setting.',
      dimensions: '274 x 243 cm',
      weight: '2.5 kg',
    },
    tags: ['cotton', 'blue', 'king-size', 'premium', 'hand-block'],
    seo: {
      metaTitle: 'Royal Blue Cotton Bedsheet - Premium King Size | Jaipur Bedsheets',
      metaDescription: 'Shop premium 100% cotton royal blue bedsheet for king size. Soft, breathable, and hand-printed.',
      metaKeywords: ['cotton bedsheet', 'king size', 'royal blue', 'jaipur'],
      canonicalUrl: '/shop/royal-blue-cotton-bedsheet-king',
      schema: {},
    },
  },
  {
    name: 'Maroon Sanganeri Print Bedsheet - Double Size',
    slug: 'maroon-sanganeri-double-size',
    description: 'Traditional Sanganeri prints in rich maroon color. Authentic Jaipur craftsmanship.',
    shortDescription: 'Beautiful Sanganeri print bedsheet for double beds',
    collection: 'Festival Collection',
    price: 1799,
    discountPrice: 1399,
    discount: 22,
    stock: 200,
    featured: true,
    images: {
      front: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      back: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      folded: 'https://images.unsplash.com/photo-1566693520318-a2db3a6795f1?w=800',
      closeup: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      gallery: [],
    },
    specifications: {
      fabric: '100% Cotton',
      weave: 'Twill',
      thread_count: 350,
      gsm: 180,
      washcare: ['Hand wash', 'Cold water', 'Dry in shade'],
      care_instructions: 'Avoid bleach. Iron on cotton setting.',
      dimensions: '229 x 229 cm',
      weight: '2.0 kg',
    },
    tags: ['cotton', 'maroon', 'double', 'sanganeri', 'traditional'],
    seo: {
      metaTitle: 'Maroon Sanganeri Print Bedsheet - Double Size | Jaipur Bedsheets',
      metaDescription: 'Authentic Sanganeri printed bedsheet in maroon. Hand-block printed cotton.',
      metaKeywords: ['sanganeri print', 'double bedsheet', 'maroon', 'jaipur'],
      canonicalUrl: '/shop/maroon-sanganeri-double-size',
      schema: {},
    },
  },
  {
    name: 'Mustard Floral Bedsheet - Single Size',
    slug: 'mustard-floral-single-size',
    description: 'Vibrant mustard color with traditional floral patterns. Perfect for single beds.',
    shortDescription: 'Floral print single size bedsheet in mustard',
    price: 999,
    discountPrice: 799,
    discount: 20,
    stock: 300,
    new: true,
    images: {
      front: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      back: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      folded: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      closeup: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      gallery: [],
    },
    specifications: {
      fabric: '100% Cotton',
      weave: 'Satin',
      thread_count: 300,
      gsm: 150,
      washcare: ['Machine wash', 'Warm water', 'Gentle cycle'],
      care_instructions: 'Iron on medium heat.',
      dimensions: '152 x 229 cm',
      weight: '1.2 kg',
    },
    tags: ['cotton', 'mustard', 'single', 'floral', 'affordable'],
  },
  {
    name: 'Beige Premium Export Bedsheet - King Size',
    slug: 'beige-premium-export-king',
    description: 'Ultra-soft export quality bedsheet in elegant beige. Perfect for guest bedrooms.',
    shortDescription: 'Premium export quality beige bedsheet',
    price: 2299,
    discountPrice: 1799,
    discount: 22,
    stock: 100,
    featured: true,
    trending: true,
    images: {
      front: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      back: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      folded: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      closeup: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      gallery: [],
    },
    specifications: {
      fabric: '100% Cotton',
      weave: 'Sateen',
      thread_count: 450,
      gsm: 220,
      washcare: ['Machine wash cold', 'Delicate cycle', 'No bleach'],
      care_instructions: 'Tumble dry low. Iron on cotton setting.',
      dimensions: '274 x 243 cm',
      weight: '2.8 kg',
    },
    tags: ['cotton', 'beige', 'king', 'premium', 'export'],
  },
  {
    name: 'White Hotel Quality Bedsheet - Double Size',
    slug: 'white-hotel-quality-double',
    description: 'Hotel collection bedsheet. Used in 5-star properties. Ultimate luxury and comfort.',
    shortDescription: 'Hotel quality white bedsheet for double beds',
    collection: 'Hotel Collection',
    price: 3499,
    discountPrice: 2499,
    discount: 29,
    stock: 80,
    bestseller: true,
    images: {
      front: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      back: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      folded: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
      closeup: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
      gallery: [],
    },
    specifications: {
      fabric: '100% Cotton',
      weave: 'Jacquard',
      thread_count: 600,
      gsm: 250,
      washcare: ['Machine wash warm', 'Standard cycle', 'Bleach allowed'],
      care_instructions: 'Dry on medium heat. Iron on cotton setting.',
      dimensions: '229 x 229 cm',
      weight: '3.0 kg',
    },
    tags: ['cotton', 'white', 'double', 'luxury', 'hotel', '5-star'],
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert categories
    const savedCategories = await Category.insertMany(
      categories.map((cat, idx) => ({
        ...cat,
        status: 'active',
        order: idx,
      }))
    );
    console.log(`✅ Created ${savedCategories.length} categories`);

    // Insert products with category references
    const productsWithCategory = products.map((product, idx) => ({
      ...product,
      category: savedCategories[idx % savedCategories.length]._id,
      status: 'active',
      avgRating: 4.5,
      totalReviews: 25,
      variants: [
        {
          size: 'King',
          color: 'Royal Blue',
          fabric: '100% Cotton',
          sku: `SKU-${idx + 1}-001`,
          stock: 50,
          price: product.price,
          discountPrice: product.discountPrice,
          weight: 2.5,
          dimensions: { length: 274, width: 243, height: 10 },
        },
      ],
    }));

    const savedProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ Created ${savedProducts.length} products`);

    // Create 20 more varied products
    const moreProducts = [];
    for (let i = 0; i < 20; i++) {
      moreProducts.push({
        name: `Premium Cotton Bedsheet ${i + 6}`,
        slug: `premium-cotton-bedsheet-${i + 6}`,
        description: `Premium quality cotton bedsheet with unique design pattern ${i + 6}`,
        shortDescription: `Quality bedsheet variant ${i + 6}`,
        category: savedCategories[i % savedCategories.length]._id,
        price: 799 + i * 100,
        discountPrice: Math.round((799 + i * 100) * 0.8),
        stock: 100 + i * 10,
        status: 'active',
        featured: i % 5 === 0,
        bestseller: i % 3 === 0,
        new: i % 7 === 0,
        trending: i % 4 === 0,
        images: {
          front: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
          back: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
          folded: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
          closeup: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
          bedroom: 'https://images.unsplash.com/photo-1540932239986-a128078d0e21?w=800',
          gallery: [],
        },
        specifications: {
          fabric: '100% Cotton',
          weave: 'Percale',
          thread_count: 300 + i * 10,
          gsm: 150 + i * 5,
          washcare: ['Machine wash', 'Cold water'],
          care_instructions: 'Iron on cotton setting',
          dimensions: '229 x 229 cm',
          weight: '2.0 kg',
        },
        tags: ['cotton', 'bedsheet', 'jaipur'],
        avgRating: 4 + Math.random() * 0.9,
        totalReviews: 15 + i,
        variants: [
          {
            size: 'Double',
            color: 'Color ' + i,
            fabric: '100% Cotton',
            sku: `SKU-VAR-${i}-001`,
            stock: 50 + i * 5,
            price: 799 + i * 100,
            discountPrice: Math.round((799 + i * 100) * 0.8),
            weight: 2.0,
            dimensions: { length: 229, width: 229, height: 10 },
          },
        ],
      });
    }

    await Product.insertMany(moreProducts);
    console.log(`✅ Created ${moreProducts.length} additional products`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`
📊 Summary:
   - Categories: ${savedCategories.length}
   - Products: ${savedProducts.length + moreProducts.length}
   - Total: ${savedCategories.length + savedProducts.length + moreProducts.length} records
    `);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
