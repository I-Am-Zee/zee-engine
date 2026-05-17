export interface RawHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface NestedHeading extends RawHeading {
  children: RawHeading[];
}

/**
 * Nests a flat array of headings (H2, H3) into a hierarchical structure.
 * Groups H3s under their preceding H2.
 */
export function nestHeadings(headings: RawHeading[]): NestedHeading[] {
  return headings.reduce((acc, heading) => {
    if (heading.depth === 2) {
      acc.push({ ...heading, children: [] });
    } else if (heading.depth === 3 && acc.length > 0) {
      acc[acc.length - 1].children.push(heading);
    }
    return acc;
  }, [] as NestedHeading[]);
}
