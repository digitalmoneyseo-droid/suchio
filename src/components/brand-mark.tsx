export function BrandMark({
  inverse = false,
}: {
  inverse?: boolean;
}) {
  return (
    // The logo is a tiny, dimensioned SVG; Next Image would not improve its transfer or layout behavior.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={inverse ? "/suchio-logo-dark.svg" : "/suchio-logo-light.svg"}
      alt="Suchio"
      width={729}
      height={223}
      className="block h-7 max-w-full w-auto object-contain"
      draggable={false}
    />
  );
}
