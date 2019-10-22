export interface Helper {
    heading: string;
    email: { address: string; text: string; };
    phone: { text: string; };
    opening: { text: string; };
}
export interface NavigationItems {
    text: string;
    href: string;
    target: string;
}
export interface Navigation {
    items: NavigationItems[];
}
