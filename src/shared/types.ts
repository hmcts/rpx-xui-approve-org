export interface NavItem { text: string; href: string; active: boolean; }
export interface NavigationItem { text: string; href: string; emit?: string; }
export interface Navigations { label: string; items: NavigationItem[]; }
export interface ServiceName { name: string; url: string; }
