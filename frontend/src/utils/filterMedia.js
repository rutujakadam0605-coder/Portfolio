import { mediaItems } from "../data/mediaItems";

export function filterMedia(selectedTag = "All", searchQuery = "") {
  const normalizedTag = selectedTag.trim().toLowerCase();
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return mediaItems.filter((item) => {
    // 1️⃣ Type filter: if selectedTag is a type, match item.type
    const typeMatch =
      normalizedTag === "all" ||
      ["graphic", "video", "uidesign", "logos"].includes(normalizedTag)
        ? item.type.toLowerCase() === normalizedTag
        : true;

    // 2️⃣ Tag filter: if selectedTag is not a type, match tags
    const tagMatch =
      normalizedTag === "all" ||
      !["graphic", "video", "uidesign", "logos"].includes(normalizedTag)
        ? item.tags.some((tag) => tag.toLowerCase() === normalizedTag)
        : true;

    // 3️⃣ Search bar filter: match either type or any tag
    const searchMatch =
      !normalizedSearch
        ? true
        : item.type.toLowerCase().includes(normalizedSearch) ||
          item.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    // ✅ Item must match all three conditions
    return typeMatch && tagMatch && searchMatch;
  });
}
