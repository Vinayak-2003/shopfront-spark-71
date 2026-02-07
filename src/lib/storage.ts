
// Utility to construct Supabase Storage URLs
// Base URL format: https://<PROJECT_REF>.supabase.co/storage/v1/object/public/<BUCKET>/<FILENAME>

// User provided project URL
const SUPABASE_PROJECT_URL = "https://kssjqicfkigdlpdhsfqq.supabase.co";
// Bucket name derived from user's link
const SUPABASE_BUCKET = "product_images";

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

    // Use Supabase Image Transformations if options are provided
    if (options) {
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

    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
};