<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use App\Models\Course;
use App\Models\BlogPost;
use App\Models\Setting;

class SitemapController extends Controller
{
    public function index(): Response
    {
        // 1. Check if the sitemap feature is enabled
        $enabled = Setting::getValue('sitemap_enabled', '1');
        if ($enabled !== '1') {
            abort(404, 'Sitemap is disabled by the administrator.');
        }

        // 2. Load sitemap path exclusions
        $exclusionsSetting = Setting::getValue('sitemap_exclusions', '');
        $rawLines = array_filter(array_map('trim', explode("\n", str_replace("\r", "", $exclusionsSetting))));
        
        $exclusions = [];
        foreach ($rawLines as $line) {
            if (empty($line)) {
                continue;
            }
            // Standardize: if full URL is given, extract path. Otherwise add absolute slash prefix.
            if (filter_var($line, FILTER_VALIDATE_URL) || str_starts_with($line, 'http://') || str_starts_with($line, 'https://') || str_starts_with($line, 'www.')) {
                $parseUrl = str_starts_with($line, 'www.') ? 'http://' . $line : $line;
                $path = parse_url($parseUrl, PHP_URL_PATH);
                if ($path !== null) {
                    $exclusions[] = '/' . ltrim($path, '/');
                }
            } else {
                $exclusions[] = '/' . ltrim($line, '/');
            }
        }

        $baseUrl = config('app.url', 'https://vibethinks.com');
        $baseUrl = rtrim($baseUrl, '/');

        $xml = [];
        $xml[] = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // 3. Static Pages
        $staticUrls = [
            '/',
            '/courses',
            '/bundles',
            '/workshops',
            '/ebooks',
            '/blog',
        ];

        foreach ($staticUrls as $url) {
            if (in_array($url, $exclusions)) {
                continue;
            }
            $xml[] = '  <url>';
            $xml[] = "    <loc>{$baseUrl}{$url}</loc>";
            $xml[] = '    <lastmod>' . date('Y-m-d') . '</lastmod>';
            $xml[] = '    <changefreq>daily</changefreq>';
            $xml[] = '    <priority>0.8</priority>';
            $xml[] = '  </url>';
        }

        // 4. Dynamic Courses (published only)
        try {
            $courses = Course::where('is_published', true)->get();
            foreach ($courses as $course) {
                if (empty($course->slug)) {
                    continue;
                }
                $path = "/courses/{$course->slug}";
                if (in_array($path, $exclusions)) {
                    continue;
                }
                $xml[] = '  <url>';
                $xml[] = "    <loc>{$baseUrl}{$path}</loc>";
                $xml[] = "    <lastmod>" . ($course->updated_at ? $course->updated_at->format('Y-m-d') : date('Y-m-d')) . "</lastmod>";
                $xml[] = '    <changefreq>weekly</changefreq>';
                $xml[] = '    <priority>0.7</priority>';
                $xml[] = '  </url>';
            }
        } catch (\Exception $e) {
            // Silence exceptions to ensure main URLs are still returned
        }

        // 5. Dynamic Blog Posts (published and indexable)
        try {
            $blogs = BlogPost::published()->indexable()->get();
            foreach ($blogs as $blog) {
                if (empty($blog->slug)) {
                    continue;
                }
                $path = "/blog/{$blog->slug}";
                if (in_array($path, $exclusions)) {
                    continue;
                }
                $xml[] = '  <url>';
                $xml[] = "    <loc>{$baseUrl}{$path}</loc>";
                $xml[] = "    <lastmod>" . ($blog->updated_at ? $blog->updated_at->format('Y-m-d') : date('Y-m-d')) . "</lastmod>";
                $xml[] = '    <changefreq>weekly</changefreq>';
                $xml[] = '    <priority>0.6</priority>';
                $xml[] = '  </url>';
            }
        } catch (\Exception $e) {
            // Silence exceptions
        }

        $xml[] = '</urlset>';

        return response(implode("\n", $xml), 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
