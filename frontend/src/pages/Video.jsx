const getEmbedUrl = (url) => {
  if (!url) return "";

  // Google Drive preview URL already
  if (
    url.includes("drive.google.com") &&
    url.includes("/preview")
  ) {
    return url;
  }

  // Google Drive file URL
  const driveMatch = url.match(
    /\/file\/d\/([^/]+)/
  );

  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // YouTube short URL
  if (url.includes("youtu.be/")) {
    const id =
      url
        .split("youtu.be/")[1]
        ?.split("?")[0];

    return `https://www.youtube.com/embed/${id}`;
  }

  // YouTube watch URL
  if (
    url.includes(
      "youtube.com/watch?v="
    )
  ) {
    const id =
      new URL(url)
        .searchParams.get("v");

    return `https://www.youtube.com/embed/${id}`;
  }

  return url;
};
