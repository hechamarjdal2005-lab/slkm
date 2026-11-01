import NextImage, { type ImageProps } from "next/image";
export default function SiteImage(props: ImageProps) {
  // Private CMS media is delivered through a publication-checked redirect.
  // Remote editorial URLs load directly in the browser, not an unrestricted optimizer.
  const direct = typeof props.src === "string" && (props.src.startsWith("/media/") || props.src.startsWith("https://"));
  return <NextImage {...props} unoptimized={props.unoptimized || direct} />;
}
