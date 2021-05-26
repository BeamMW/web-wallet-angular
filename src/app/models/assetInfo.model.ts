import { AssetMetadata } from './assetMetadata.model';

export interface AssetInfo {
    asset_id: number;
    emission: number;
    emission_str: string;
    isOwned: number;
    lockHeight: number;
    ownerId: string;
    refreshHeight: number;
    metadata: AssetMetadata
}
