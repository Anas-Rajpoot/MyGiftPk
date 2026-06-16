/**
 * Global settings (free-shipping threshold, gift-wrap price, footer, socials,
 * contact) are now read from the native mygift-core REST endpoint via
 * lib/wp/home-content.ts (`fetchGlobalOptions`). The interfaces below remain
 * the shared shape for those values and the footer components.
 */

export interface NavLink {
  label: string
  link: string
}

export interface NavItem extends NavLink {
  children?: NavLink[]
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export interface FooterSocials {
  instagram?: string
  facebook?: string
  whatsapp?: string
}

export interface FooterContact {
  phone?: string
  email?: string
}

export interface FooterData {
  columns: FooterColumn[]
  socials: FooterSocials
  contact: FooterContact
  bottomText: string
}

export interface AnnouncementBarData {
  enabled: boolean
  text: string
  link?: string
}

export interface GlobalOptions {
  announcementBar: AnnouncementBarData
  freeShippingThreshold: number
  giftWrapPrice: number
  headerMenu: NavItem[]
  footer: FooterData
}

export interface GlobalOptionsResponse {
  globalOptions: GlobalOptions
}
