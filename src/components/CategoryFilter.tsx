import { useVideos } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, videos } = useVideos();

  const getCategoryCount = (categoryId: string | null) => {
    if (categoryId === null) return videos.length;
    return videos.filter(v => v.categoryId === categoryId).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedCategory(null)}
        className="rounded-full"
      >
        All ({getCategoryCount(null)})
      </Button>
      
      {categories.map((category) => {
        const count = getCategoryCount(category.id);
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(isSelected ? null : category.id)}
            className={cn(
              'rounded-full border-2 transition-all',
              isSelected && 'border-transparent'
            )}
            style={isSelected ? {
              backgroundColor: `hsl(${category.color})`,
              color: 'white',
              borderColor: `hsl(${category.color})`,
            } : {
              borderColor: `hsl(${category.color} / 0.5)`,
              color: `hsl(${category.color})`,
            }}
          >
            {category.name} ({count})
          </Button>
        );
      })}
    </div>
  );
}
