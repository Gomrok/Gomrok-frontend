# Asset provenance

The client logo is an unchanged binary copy of `Gomrok_Figma_Codex_Design_Brief/assets/gomrok_original_logo.jpg`. The original white-background raster is clipped by layout frames for header/footer use; no alternate mark is fabricated.

## Actual photographs

| File | Photographer | Original page |
| --- | --- | --- |
| `photos/port.jpg` | Diego F. Parra | [Port containers and machinery](https://www.pexels.com/photo/aerial-view-of-containers-and-machinery-in-a-port-24244234/) |
| `photos/warehouse.jpg` | Freek Wolsink | [Industrial warehouse](https://www.pexels.com/photo/industrial-warehouse-with-stacked-cardboard-boxes-34221998/) |
| `photos/operations.jpg` | Daniel Andraski | [Person with clipboard in warehouse](https://www.pexels.com/photo/person-with-clipboard-in-warehouse-12234107/) |
| `photos/freight.jpg` | Ahmet Polat | [Trailer truck on a road](https://www.pexels.com/photo/a-trailer-truck-on-the-road-5410923/) |

These photographs are used under the [Pexels License](https://www.pexels.com/license/), resized/re-encoded for this design and cropped by its layouts. Their subjects do not represent Gomrok staff, customers, partners or available drivers. The images are photographs, not generated website screenshots.

## Vector icons

Lucide icons are sourced from the official [Lucide repository](https://github.com/lucide-icons/lucide), with the exact source commit in `assets/icons/source-commit.txt`. The ISC license is retained in `assets/icons/LICENSE`. The official source renamed the historical `circle-help` icon to `circle-question-mark`; the local filename is an explicit compatibility alias. No icon font is used.

## Geographic boundaries

Source: [geoBoundaries IRN ADM1 API](https://www.geoboundaries.org/api/current/gbOpen/IRN/ADM1/), boundary ID `IRN-ADM1-17685810`, derived from OpenStreetMap/Wambacher. The supplied release represents 2017 geography and is pinned to the source URL and SHA-256 recorded in `asset-manifest.json`.

The source contains 32 features with two Mazandaran features. The map retains both geometry parts under one province name, giving 31 distinct provinces without inventing boundaries. `scripts/build_map.py` projects the geometry using Web Mercator into a 710×600 viewBox. Projection changes are documented; the source GeoJSON remains included.

The source database and derived geographic data retain the **Open Data Commons Open Database License 1.0** attribution: © OpenStreetMap contributors, distributed through geoBoundaries. See [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). This is a UI design map, with no claim of legal boundary precision, government endorsement, live positions or current vehicle availability.

## Font

Vazirmatn is referenced from Google Fonts for preview rendering. No font binary is redistributed. The [official Vazirmatn repository](https://github.com/rastikerdar/vazirmatn) is the source for local font installation if required by Figma.
