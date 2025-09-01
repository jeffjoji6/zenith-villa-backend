const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8083",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Zenith Villa Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Get all photos from Cloudinary
app.get("/api/photos", async (req, res) => {
  try {
    console.log("Fetching photos from Cloudinary...");

    // Fetch photos from Cloudinary using Admin API
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "zenith-villa-gallery",
      max_results: 100,
      resource_type: "image",
    });

    console.log(`Found ${result.resources.length} photos`);

    // Transform Cloudinary resources to our PhotoItem format
    const photos = result.resources.map((resource) => {
      // Extract metadata from context
      const context = resource.context || {};

      // Parse context string if it exists (format: "title=value|category=value|uploadDate=value")
      let title = "Villa Photo";
      let category = "Gallery";

      // Try to extract a better title from the filename if available
      if (resource.original_filename) {
        const filename = resource.original_filename;
        // Remove file extension and clean up the name
        title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, (l) => l.toUpperCase());
      } else {
        // Create a more meaningful title from the public_id
        const idParts = resource.public_id.split("/").pop() || "";
        if (idParts.length > 8) {
          title = `Villa Photo ${idParts.substring(0, 8)}`;
        } else {
          title = `Villa Photo ${idParts}`;
        }
      }

      // Check if context is a string and parse it
      if (typeof context === "string" && context.includes("|")) {
        const contextPairs = context.split("|");
        contextPairs.forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key === "title" && value) {
            title = value;
          }
          if (key === "category" && value) {
            category = value;
          }
        });
      }

      // Check for object context properties
      if (context.custom && context.custom.title) {
        title = context.custom.title;
      }
      if (context.custom && context.custom.category) {
        category = context.custom.category;
      }

      // Also check for direct context properties
      if (context.title) {
        title = context.title;
      }
      if (context.category) {
        category = context.category;
      }

      return {
        id: resource.public_id,
        title,
        category,
        imageUrl: resource.secure_url,
        uploadDate: new Date(resource.created_at),
        fileName:
          resource.original_filename || resource.public_id.split("/").pop(),
        publicId: resource.public_id,
      };
    });

    // Sort by upload date (newest first)
    const sortedPhotos = photos.sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );

    res.json({
      success: true,
      photos: sortedPhotos,
      count: sortedPhotos.length,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch photos",
      message: error.message,
    });
  }
});

// Delete photo from Cloudinary
app.delete("/api/photos/:photoId", async (req, res) => {
  try {
    const { photoId } = req.params;

    console.log(`Deleting photo: ${photoId}`);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(photoId);

    if (result.result === "ok") {
      console.log(`Successfully deleted photo: ${photoId}`);
      res.json({
        success: true,
        message: "Photo deleted successfully",
        photoId: photoId,
      });
    } else {
      console.log(`Failed to delete photo: ${photoId}`, result);
      res.status(404).json({
        success: false,
        error: "Photo not found or already deleted",
        photoId: photoId,
      });
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete photo",
      message: error.message,
    });
  }
});

// Get photo by ID
app.get("/api/photos/:photoId", async (req, res) => {
  try {
    const { photoId } = req.params;

    console.log(`Fetching photo: ${photoId}`);

    // Get photo details from Cloudinary
    const result = await cloudinary.api.resource(photoId);

    // Transform to our format
    const context = result.context || {};

    // Parse context string if it exists (format: "title=value|category=value|uploadDate=value")
    let title = "Villa Photo";
    let category = "Gallery";

    // Try to extract a better title from the filename if available
    if (result.original_filename) {
      const filename = result.original_filename;
      // Remove file extension and clean up the name
      title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      // Capitalize first letter of each word
      title = title.replace(/\b\w/g, (l) => l.toUpperCase());
    } else {
      // Create a more meaningful title from the public_id
      const idParts = result.public_id.split("/").pop() || "";
      if (idParts.length > 8) {
        title = `Villa Photo ${idParts.substring(0, 8)}`;
      } else {
        title = `Villa Photo ${idParts}`;
      }
    }

    // Check if context is a string and parse it
    if (typeof context === "string" && context.includes("|")) {
      const contextPairs = context.split("|");
      contextPairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key === "title" && value) {
          title = value;
        }
        if (key === "category" && value) {
          category = value;
        }
      });
    }

    // Check for object context properties
    if (context.custom && context.custom.title) {
      title = context.custom.title;
    }
    if (context.custom && context.custom.category) {
      category = context.custom.category;
    }

    // Also check for direct context properties
    if (context.title) {
      title = context.title;
    }
    if (context.category) {
      category = context.category;
    }

    const photo = {
      id: result.public_id,
      title,
      category,
      imageUrl: result.secure_url,
      uploadDate: new Date(result.created_at),
      fileName: result.original_filename || result.public_id.split("/").pop(),
      publicId: result.public_id,
    };

    res.json({
      success: true,
      photo: photo,
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(404).json({
      success: false,
      error: "Photo not found",
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Zenith Villa Backend API running on port ${PORT}`);
  console.log(
    `📸 Cloudinary configured for: ${process.env.CLOUDINARY_CLOUD_NAME}`
  );
  console.log(
    `🌐 CORS enabled for: ${
      process.env.FRONTEND_URL || "http://localhost:8083"
    }`
  );
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
