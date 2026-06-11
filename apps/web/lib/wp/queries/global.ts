export const GET_GLOBAL_OPTIONS = `
  query GetGlobalOptions {
    globalOptions {
      announcementBar {
        enabled
        text
        link
      }
      freeShippingThreshold
      giftWrapPrice
      headerMenu {
        label
        link
        children {
          label
          link
        }
      }
      footer {
        columns {
          heading
          links {
            label
            href
          }
        }
        socials {
          instagram
          facebook
          whatsapp
        }
        contact {
          phone
          email
        }
        bottomText
      }
    }
  }
`

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
