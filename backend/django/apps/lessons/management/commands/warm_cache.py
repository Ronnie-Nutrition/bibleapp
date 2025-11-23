"""
Management command to warm up application caches
"""

from django.core.management.base import BaseCommand
from apps.lessons.cache import warm_cache, get_cache_stats
import time


class Command(BaseCommand):
    help = 'Warm up application caches for better performance'

    def add_arguments(self, parser):
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Show cache statistics after warming',
        )
        parser.add_argument(
            '--clear-first',
            action='store_true',
            help='Clear caches before warming',
        )

    def handle(self, *args, **options):
        start_time = time.time()
        
        if options['clear_first']:
            self.stdout.write('Clearing existing caches...')
            from apps.lessons.cache import clear_all_caches
            clear_all_caches()
            self.stdout.write(self.style.WARNING('Caches cleared'))

        self.stdout.write('Starting cache warm-up...')
        
        try:
            warm_cache()
            
            end_time = time.time()
            duration = end_time - start_time
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Cache warm-up completed successfully in {duration:.2f} seconds'
                )
            )
            
            if options['stats']:
                self.stdout.write('\nCache Statistics:')
                stats = get_cache_stats()
                for key, value in stats.items():
                    self.stdout.write(f'  {key}: {value}')
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Cache warm-up failed: {str(e)}')
            )