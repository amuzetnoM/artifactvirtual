// Defines the structure for navigation items and groups

// Represents a single navigation link, possibly with children
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string; // For icon class names or SVG paths
  isActive?: boolean; // To be determined by router
  badge?: string | number;
  isExpanded?: boolean; // For parent items to control visibility of children
  children?: NavigationItem[];
  isChild?: boolean; // To identify if an item is a child for styling
}

// Represents a group of navigation items, with a title for the group
export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
} 