// Server-side plugin to ensure all Mongoose models are registered
// This is critical for production builds where dynamic imports might not work correctly

export default defineNuxtPlugin(async () => {
  // Import all models to ensure they are registered with Mongoose
  if (process.server) {
    try {
      await import('~/models')
      console.log('✅ All Mongoose models loaded successfully')
    } catch (error) {
      console.error('❌ Error loading Mongoose models:', error)
    }
  }
})