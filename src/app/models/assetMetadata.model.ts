export interface AssetMetadata {
    asset_name: string;
    short_name: string;
    unit_name: string;
    smallest_unit_name: string;
    ratio?: number;
    short_desc?: string;
    long_desc?: string;
    site_url?: string;
    pdf_url?: string;
    favicon_url?: string;
    logo_url?: string;
    color?: string;
}