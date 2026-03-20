
// Utility to construct Supabase Storage URLs
// Base URL format: https://<PROJECT_REF>.supabase.co/storage/v1/object/public/<BUCKET>/<FILENAME>

// User provided project URL
const SUPABASE_PROJECT_URL = "https://kssjqicfkigdlpdhsfqq.supabase.co";
// Bucket name derived from user's link
const SUPABASE_BUCKET = "product_images";

// Set to true if you have Supabase's Image Transformation feature enabled (paid plan)
// If false, will use direct object URLs without transformations
const ENABLE_IMAGE_TRANSFORMATIONS = false;

interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
}

export const getProductImageUrl = (filename?: string | null, options?: ImageOptions): string => {
    if (!filename) return "/placeholder-product.svg";

    // If it's already a full URL (e.g. from an external source or migration), return it
    if (filename.startsWith("http")) return filename;

    // Use Supabase Image Transformations only if enabled and options are provided
    if (ENABLE_IMAGE_TRANSFORMATIONS && options) {
        const params = new URLSearchParams();
        if (options.width) params.append('width', options.width.toString());
        if (options.height) params.append('height', options.height.toString());
        if (options.quality) params.append('quality', options.quality.toString());
        if (options.format) params.append('format', options.format);

        // Use 'contain' to ensure the full image is visible without cropping
        params.append('resize', 'contain');

        // Use 'render/image' endpoint for transformations
        return `${SUPABASE_PROJECT_URL}/storage/v1/render/image/public/${SUPABASE_BUCKET}/${filename}?${params.toString()}`;
    }

    // Fallback to direct object URL (works for all Supabase plans)
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
};