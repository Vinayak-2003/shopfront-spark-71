
// Utility to construct Supabase Storage URLs
// Base URL format: https://<PROJECT_REF>.supabase.co/storage/v1/object/public/<BUCKET>/<FILENAME>

// User provided project URL
const SUPABASE_PROJECT_URL = "https://kssjqicfkigdlpdhsfqq.supabase.co";
// Bucket name derived from user's link
const SUPABASE_BUCKET = "product_images";

export const getProductImageUrl = (filename?: string | null): string => {
    if (!filename) return "/placeholder-product.svg";

    // If it's already a full URL (e.g. from an external source or migration), return it
    if (filename.startsWith("http")) return filename;

    // We enforce the 'public' route here.
    // CRITICAL: The bucket in Supabase MUST be set to "Public" for this to work without tokens.
    console.log(`${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`);
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
};
