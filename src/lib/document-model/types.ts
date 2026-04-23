export type PressFlowMode = "presentation" | "landing" | "article";

export type PressFlowSectionKind =
  | "hero"
  | "featureGrid"
  | "testimonial"
  | "cta"
  | "longformText"
  | "slide";

export interface BaseSection {
  id: string;
  kind: PressFlowSectionKind;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  accent?: "default" | "muted" | "brand";
}

export interface SlideSection extends BaseSection {
  kind: "slide";
  notes?: string;
}

export interface HeroSection extends BaseSection {
  kind: "hero";
  eyebrow?: string;
}

export interface FeatureGridSection extends BaseSection {
  kind: "featureGrid";
  features: Array<{ id: string; title: string; description: string }>;
}

export interface TestimonialSection extends BaseSection {
  kind: "testimonial";
  quote: string;
  author: string;
  role?: string;
}

export interface CtaSection extends BaseSection {
  kind: "cta";
  buttonLabel: string;
  buttonHref: string;
}

export interface LongformTextSection extends BaseSection {
  kind: "longformText";
  markdown: string;
}

export type PressFlowSection =
  | SlideSection
  | HeroSection
  | FeatureGridSection
  | TestimonialSection
  | CtaSection
  | LongformTextSection;

export interface PressFlowTheme {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  radius: "sm" | "md" | "lg";
  density: "compact" | "comfortable";
}

export interface PressFlowDocument {
  id: string;
  name: string;
  mode: PressFlowMode;
  version: 1;
  createdAt: string;
  updatedAt: string;
  theme: PressFlowTheme;
  sections: PressFlowSection[];
}
