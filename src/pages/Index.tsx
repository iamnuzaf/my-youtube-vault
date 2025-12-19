import { NavBar } from '@/components/NavBar';
import { VideoForm } from '@/components/VideoForm';
import { VideoGrid } from '@/components/VideoGrid';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { VideoProvider } from '@/context/VideoContext';

const Index = () => {
  return (
    <VideoProvider>
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <main className="container py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Video Input Form */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Add New Video</h2>
              <VideoForm />
            </section>

            {/* Filters and Category Management */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Your Videos</h2>
                  <p className="text-sm text-muted-foreground">Filter by category or manage your categories</p>
                </div>
                <CategoryManager />
              </div>
              <CategoryFilter />
            </section>

            {/* Video Grid */}
            <section>
              <VideoGrid />
            </section>
          </div>
        </main>
      </div>
    </VideoProvider>
  );
};

export default Index;
