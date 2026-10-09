import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { getMarketNews } from '../api/client';
import CategoryChips from '../components/CategoryChips';
import NewsCard from '../components/NewsCard';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

/**
 * /news Screen (Public, no login needed):
 * - Header "What's happening in tech today"
 * - Category filter chips built from response "categories"
 *   (Layoffs, Funding, Unicorns, Packages, Launches, Hiring, Other) with colored dots
 * - News cards in responsive grid: category badge, title (opens in new tab), summary, source, relative time
 * - Footer note: "Summarized automatically from public sources. Always check the original article."
 * - Skeletons while loading with text "Fetching today's market news..."
 * - Friendly error with retry; empty state
 */
export default function News() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNews = useCallback(async (cat = selectedCategory) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getMarketNews({
        category: cat === 'all' ? null : cat,
        limit: 30,
      });
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
      setNewsItems(data.items || []);
    } catch (err) {
      setErrorMessage(err.message || 'Could not load today’s tech market news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header Banner */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 mb-8 shadow-soft">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
              Market Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-2">
            What's happening in tech today
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Real-time feed tracking layoffs, hiring waves, compensation packages, funding events, and emerging technical breakthroughs.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-6 pt-5 border-t border-surface-border">
          <CategoryChips
            categories={categories.length > 0 ? categories : ['layoff', 'funding', 'unicorn', 'package', 'launch', 'hiring', 'other']}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            showAllOption={true}
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-surface-border shadow-soft mb-8">
            <Spinner size="md" />
            <span className="text-sm font-semibold text-ink">Fetching today's market news...</span>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft animate-pulse flex flex-col justify-between h-56"
              >
                <div>
                  <div className="flex justify-between mb-3">
                    <div className="w-16 h-4 bg-surface-border rounded" />
                    <div className="w-12 h-3 bg-surface-border rounded" />
                  </div>
                  <div className="w-full h-5 bg-surface-border rounded mb-2" />
                  <div className="w-3/4 h-5 bg-surface-border rounded mb-3" />
                  <div className="w-full h-3 bg-surface-border rounded mb-1" />
                  <div className="w-2/3 h-3 bg-surface-border rounded" />
                </div>
                <div className="pt-3 border-t border-surface-border flex justify-between">
                  <div className="w-20 h-3 bg-surface-border rounded" />
                  <div className="w-16 h-3 bg-surface-border rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error with Retry */}
      {!isLoading && errorMessage && (
        <div className="max-w-xl mx-auto my-8 w-full">
          <ErrorAlert message={errorMessage} onRetry={() => fetchNews(selectedCategory)} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && newsItems.length === 0 && (
        <EmptyState
          title="No news articles found"
          description="We couldn't find any articles matching this specific category right now."
          actionText="View all categories"
          onAction={() => setSelectedCategory('all')}
        />
      )}

      {/* News Cards Grid */}
      {!isLoading && !errorMessage && newsItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item, idx) => (
            <NewsCard key={`${item.link}-${idx}`} item={item} />
          ))}
        </div>
      )}

      {/* Mandatory Disclaimer Footer */}
      <div className="mt-12 text-center text-xs text-ink-muted/80 py-4 border-t border-surface-border">
        Summarized automatically from public sources. Always check the original article.
      </div>
    </div>
  );
}
