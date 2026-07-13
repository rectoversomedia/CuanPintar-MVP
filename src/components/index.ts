/**
 * Component Exports
 *
 * Centralized exports for all reusable components
 */

// UI Components
export { Button } from './ui/button';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
export { Badge } from './ui/badge';
export { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from './ui/dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
export { Switch } from './ui/switch';
export { Progress } from './ui/progress';
export { Checkbox } from './ui/checkbox';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export { Textarea } from './ui/textarea';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
export { Toast } from './ui/toast';
export { Skeleton } from './ui/skeleton';
export { StatsCard } from './ui/stats-card';
export { PageHeader } from './ui/page-header';
export { EmptyState } from './ui/empty-state';

// NEW UI Components
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipWrapper } from './ui/tooltip';
export { Pagination, PaginationInfo } from './ui/pagination';
export { Calendar, DatePickerInput } from './ui/calendar';
export { FileUpload, formatFileSize } from './ui/file-upload';
export { QRCodeGenerator } from './ui/qr-code';

// Layout Components
export { Header } from './layout/header';
export { Sidebar } from './layout/sidebar';
export { DashboardLayout } from './layout/dashboard-layout';

// Feature Components
export { ThemeToggle, SimpleThemeToggle } from './theme-toggle';
export { LanguageSwitcher, SimpleLanguageSwitcher } from './language-switcher';
export { SEOMeta, SEOProvider, useSEO } from './seo';
export { SkipLink, LiveRegion, VisuallyHidden, useKeyboardNavigation, useAnnounce } from './accessibility';
export { TrackingPixel } from './tracking/tracking-pixel';
