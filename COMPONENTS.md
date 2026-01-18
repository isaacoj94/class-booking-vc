# Component Library Documentation

## UI Components

### Button
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Variants**: `primary`, `secondary`, `danger`, `ghost`
**Sizes**: `sm`, `md`, `lg`
**Props**: Standard button props + `loading`, `variant`, `size`

### Input
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="Enter your email address"
  leftIcon={<Icon />}
/>
```

**Props**: Standard input props + `label`, `error`, `helperText`, `leftIcon`, `rightIcon`

### Select
```tsx
import Select from '@/components/ui/Select';

<Select
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" }
  ]}
  error="Required"
/>
```

### Textarea
```tsx
import Textarea from '@/components/ui/Textarea';

<Textarea
  label="Description"
  rows={4}
  error="Too long"
/>
```

### Card
```tsx
import Card, { CardHeader } from '@/components/ui/Card';

<Card hover>
  <CardHeader title="Title" subtitle="Subtitle" />
  Content here
</Card>
```

### Badge
```tsx
import Badge from '@/components/ui/Badge';

<Badge variant="success" size="md">Active</Badge>
```

**Variants**: `success`, `warning`, `error`, `info`, `neutral`

### Alert
```tsx
import Alert from '@/components/ui/Alert';

<Alert variant="success" onClose={() => {}}>
  Success message
</Alert>
```

**Variants**: `success`, `error`, `warning`, `info`

## Composite Components

### Navigation
```tsx
import Navigation from '@/components/Navigation';

<Navigation role="customer" /> // or "admin"
```

### NotificationsCenter
```tsx
import NotificationsCenter from '@/components/NotificationsCenter';

<NotificationsCenter />
```

### SearchFilter
```tsx
import SearchFilter from '@/components/SearchFilter';

<SearchFilter
  placeholder="Search customers..."
  onSearch={(query) => {}}
  onFilter={(filters) => {}}
  filters={[
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" }
      ]
    }
  ]}
/>
```

### LoadingSkeleton
```tsx
import { StatsSkeleton, TableSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';

<StatsSkeleton />
<TableSkeleton rows={5} />
<CardSkeleton />
```

### EmptyState
```tsx
import EmptyState from '@/components/EmptyState';

<EmptyState
  icon="📭"
  title="No bookings yet"
  description="Book your first class to get started"
  action={{
    label: "Book a Class",
    onClick: () => {}
  }}
/>
```

### ErrorBoundary
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Utility Components

### Loading States
- `StatsSkeleton` - For stats cards
- `TableSkeleton` - For data tables
- `CardSkeleton` - For card content

## Usage Patterns

### Forms
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <Input
    label="First Name"
    name="firstName"
    required
    error={errors.firstName}
  />
  <Select
    label="Membership Type"
    options={membershipOptions}
    value={formData.type}
    onChange={(e) => {}}
  />
  <Textarea
    label="Notes"
    rows={4}
  />
  <Button type="submit" loading={isLoading}>
    Save
  </Button>
</form>
```

### Data Display
```tsx
<div className="space-y-4">
  {items.length === 0 ? (
    <EmptyState
      title="No items"
      description="Get started by creating one"
      action={{ label: "Create", onClick: handleCreate }}
    />
  ) : (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} hover>
          {item.content}
        </Card>
      ))}
    </div>
  )}
</div>
```

### Error Handling
```tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```
