"""
Management command to analyze database performance and suggest optimizations
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps
import time


class Command(BaseCommand):
    help = 'Analyze database performance and suggest optimizations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--slow-queries',
            action='store_true',
            help='Show slow query analysis',
        )
        parser.add_argument(
            '--index-usage',
            action='store_true',
            help='Analyze index usage',
        )
        parser.add_argument(
            '--table-sizes',
            action='store_true',
            help='Show table sizes',
        )

    def handle(self, *args, **options):
        self.stdout.write('=== Database Performance Analysis ===\n')
        
        if options.get('slow_queries'):
            self.analyze_slow_queries()
        
        if options.get('index_usage'):
            self.analyze_index_usage()
        
        if options.get('table_sizes'):
            self.analyze_table_sizes()
        
        if not any(options.values()):
            # Run all analyses by default
            self.analyze_slow_queries()
            self.analyze_index_usage()
            self.analyze_table_sizes()

    def analyze_slow_queries(self):
        """Analyze slow queries from PostgreSQL stats"""
        self.stdout.write(self.style.HTTP_INFO('=== Slow Query Analysis ==='))
        
        with connection.cursor() as cursor:
            # Check if pg_stat_statements is available
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
                );
            """)
            
            if not cursor.fetchone()[0]:
                self.stdout.write(
                    self.style.WARNING('pg_stat_statements extension not available')
                )
                return
            
            # Get slowest queries
            cursor.execute("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements 
                WHERE query NOT LIKE '%pg_stat_statements%'
                ORDER BY total_time DESC 
                LIMIT 10;
            """)
            
            rows = cursor.fetchall()
            if rows:
                for query, calls, total_time, mean_time, query_rows in rows:
                    self.stdout.write(f'Query: {query[:100]}...')
                    self.stdout.write(f'  Calls: {calls}')
                    self.stdout.write(f'  Total Time: {total_time:.2f}ms')
                    self.stdout.write(f'  Mean Time: {mean_time:.2f}ms')
                    self.stdout.write(f'  Rows: {query_rows}')
                    self.stdout.write('')
            else:
                self.stdout.write('No slow queries found')

    def analyze_index_usage(self):
        """Analyze index usage statistics"""
        self.stdout.write(self.style.HTTP_INFO('=== Index Usage Analysis ==='))
        
        with connection.cursor() as cursor:
            # Get index usage stats
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes 
                WHERE idx_tup_read = 0 OR idx_tup_fetch = 0
                ORDER BY schemaname, tablename;
            """)
            
            unused_indexes = cursor.fetchall()
            if unused_indexes:
                self.stdout.write(self.style.WARNING('Unused Indexes:'))
                for schema, table, index, reads, fetches in unused_indexes:
                    self.stdout.write(f'  {schema}.{table}.{index}')
            else:
                self.stdout.write(self.style.SUCCESS('All indexes are being used'))
            
            # Get tables without primary key
            cursor.execute("""
                SELECT schemaname, tablename
                FROM pg_tables 
                WHERE schemaname = 'public'
                  AND tablename NOT IN (
                    SELECT tablename 
                    FROM pg_indexes 
                    WHERE schemaname = 'public' 
                      AND indexname LIKE '%_pkey'
                  );
            """)
            
            no_pk_tables = cursor.fetchall()
            if no_pk_tables:
                self.stdout.write(self.style.ERROR('Tables without Primary Key:'))
                for schema, table in no_pk_tables:
                    self.stdout.write(f'  {schema}.{table}')

    def analyze_table_sizes(self):
        """Analyze table and index sizes"""
        self.stdout.write(self.style.HTTP_INFO('=== Table Size Analysis ==='))
        
        with connection.cursor() as cursor:
            # Get table sizes
            cursor.execute("""
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
                    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
            """)
            
            self.stdout.write('Table Sizes:')
            self.stdout.write(f'{"Table":<40} {"Total":<15} {"Table":<15} {"Indexes":<15}')
            self.stdout.write('-' * 85)
            
            for schema, table, total_size, table_size, index_size in cursor.fetchall():
                self.stdout.write(f'{table:<40} {total_size:<15} {table_size:<15} {index_size:<15}')

    def get_connection_stats(self):
        """Get database connection statistics"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    numbackends,
                    xact_commit,
                    xact_rollback,
                    blks_read,
                    blks_hit,
                    tup_returned,
                    tup_fetched,
                    tup_inserted,
                    tup_updated,
                    tup_deleted
                FROM pg_stat_database 
                WHERE datname = current_database();
            """)
            
            return cursor.fetchone()