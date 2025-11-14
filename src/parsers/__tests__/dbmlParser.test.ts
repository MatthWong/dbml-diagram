import { DBMLParser, parseDBML } from '../dbmlParser';
import { ParseResult } from '../../types/database';

describe('DBMLParser', () => {
  let parser: DBMLParser;

  beforeEach(() => {
    parser = new DBMLParser();
  });

  describe('Basic table parsing', () => {
    it('should parse a simple table definition', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255) [not null]
          email varchar(255) [unique]
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.tables).toHaveLength(1);
      
      const table = result.schema.tables[0];
      expect(table.name).toBe('users');
      expect(table.columns).toHaveLength(3);
      
      const idColumn = table.columns.find(c => c.name === 'id');
      expect(idColumn?.primaryKey).toBe(true);
      
      const nameColumn = table.columns.find(c => c.name === 'name');
      expect(nameColumn?.notNull).toBe(true);
      
      const emailColumn = table.columns.find(c => c.name === 'email');
      expect(emailColumn?.unique).toBe(true);
    });

    it('should parse table with schema prefix', () => {
      const dbml = `
        Table public.users {
          id integer [pk]
          name varchar(255)
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.tables).toHaveLength(1);
      
      const table = result.schema.tables[0];
      expect(table.name).toBe('users');
      expect(table.schema).toBe('public');
    });

    it('should handle table notes', () => {
      const dbml = `
        Table users [note: 'User accounts table'] {
          id integer [pk]
          name varchar(255)
          Note: 'This table stores user information'
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      const table = result.schema.tables[0];
      expect(table.note).toBe('This table stores user information');
    });
  });

  describe('Column parsing', () => {
    it('should parse various column types and constraints', () => {
      const dbml = `
        Table products {
          id integer [pk, increment]
          name varchar(255) [not null]
          price decimal(10,2) [default: 0.00]
          description text [note: 'Product description']
          created_at timestamp [default: 'now()']
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      const table = result.schema.tables[0];
      expect(table.columns).toHaveLength(5);
      
      const priceColumn = table.columns.find(c => c.name === 'price');
      expect(priceColumn?.default).toBe('0.00');
      
      const descColumn = table.columns.find(c => c.name === 'description');
      expect(descColumn?.note).toBe('Product description');
    });

    it('should handle inline foreign key references', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255)
        }
        
        Table posts {
          id integer [pk]
          user_id integer [ref: > users.id]
          title varchar(255)
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.references).toHaveLength(1);
      
      const reference = result.schema.references[0];
      expect(reference.fromTable).toBe('posts');
      expect(reference.fromColumn).toBe('user_id');
      expect(reference.toTable).toBe('users');
      expect(reference.toColumn).toBe('id');
      expect(reference.type).toBe('one-to-many');
    });
  });

  describe('Reference parsing', () => {
    it('should parse standalone reference definitions', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255)
        }
        
        Table posts {
          id integer [pk]
          user_id integer
          title varchar(255)
        }
        
        Ref: posts.user_id > users.id
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.references).toHaveLength(1);
      
      const reference = result.schema.references[0];
      expect(reference.type).toBe('one-to-many');
    });

    it('should parse different relationship types', () => {
      const dbml = `
        Table users {
          id integer [pk]
        }
        
        Table profiles {
          id integer [pk]
          user_id integer
        }
        
        Table posts {
          id integer [pk]
          user_id integer
        }
        
        Table post_tags {
          post_id integer
          tag_id integer
        }
        
        Table tags {
          id integer [pk]
        }
        
        Ref: profiles.user_id - users.id
        Ref: posts.user_id > users.id
        Ref: post_tags.post_id < posts.id
        Ref: post_tags.tag_id <> tags.id
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.references).toHaveLength(4);
      
      const refs = result.schema.references;
      expect(refs[0].type).toBe('one-to-one');
      expect(refs[1].type).toBe('one-to-many');
      expect(refs[2].type).toBe('many-to-one');
      expect(refs[3].type).toBe('many-to-many');
    });

    it('should parse reference constraints', () => {
      const dbml = `
        Table users {
          id integer [pk]
        }
        
        Table posts {
          id integer [pk]
          user_id integer
        }
        
        Ref: posts.user_id > users.id [delete: cascade, update: restrict]
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      const reference = result.schema.references[0];
      expect(reference.onDelete).toBe('cascade');
      expect(reference.onUpdate).toBe('restrict');
    });
  });

  describe('Error handling', () => {
    it('should report invalid table names', () => {
      const dbml = `
        Table 123invalid {
          id integer [pk]
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid table name');
      expect(result.errors[0].suggestion).toBeDefined();
    });

    it('should report duplicate table names', () => {
      const dbml = `
        Table users {
          id integer [pk]
        }
        
        Table users {
          id integer [pk]
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Duplicate table name');
    });

    it('should report invalid column names', () => {
      const dbml = `
        Table users {
          123invalid integer [pk]
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid column name');
    });

    it('should report references to non-existent tables', () => {
      const dbml = `
        Table posts {
          id integer [pk]
          user_id integer
        }
        
        Ref: posts.user_id > nonexistent.id
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Referenced table not found');
    });

    it('should report references to non-existent columns', () => {
      const dbml = `
        Table users {
          id integer [pk]
        }
        
        Table posts {
          id integer [pk]
          user_id integer
        }
        
        Ref: posts.user_id > users.nonexistent
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Referenced column not found');
    });

    it('should continue parsing after errors', () => {
      const dbml = `
        Table 123invalid {
          id integer [pk]
        }
        
        Table valid_table {
          id integer [pk]
          name varchar(255)
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.schema.tables).toHaveLength(1); // Should still parse the valid table
      expect(result.schema.tables[0].name).toBe('valid_table');
    });
  });

  describe('Warnings', () => {
    it('should warn about unsupported features', () => {
      const dbml = `
        Enum status {
          active
          inactive
        }
        
        Table users {
          id integer [pk]
          status status
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Enum definitions are not fully supported');
    });

    it('should warn about unknown settings', () => {
      const dbml = `
        Table users {
          id integer [pk, unknown_setting: true]
          name varchar(255)
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('Unknown column setting');
    });
  });

  describe('Metadata and features', () => {
    it('should track parsing metadata', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255) [not null]
        }
        
        Ref: users.id > users.id
      `;

      const result = parser.parse(dbml);
      
      expect(result.metadata.parseTime).toBeGreaterThan(0);
      expect(result.metadata.linesProcessed).toBeGreaterThan(0);
      expect(result.metadata.featuresUsed).toContain('tables');
      expect(result.metadata.featuresUsed).toContain('columns');
      expect(result.metadata.featuresUsed).toContain('references');
      expect(result.metadata.featuresUsed).toContain('primary_keys');
    });

    it('should create proper schema structure', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255)
        }
      `;

      const result = parser.parse(dbml);
      
      expect(result.schema.tables).toBeDefined();
      expect(result.schema.references).toBeDefined();
      expect(result.schema.annotations).toBeDefined();
      expect(result.schema.settings).toBeDefined();
      expect(result.schema.metadata).toBeDefined();
      expect(result.schema.metadata.version).toBeDefined();
      expect(result.schema.metadata.created).toBeDefined();
      expect(result.schema.metadata.modified).toBeDefined();
    });
  });

  describe('Backward compatibility', () => {
    it('should work with the convenience function', () => {
      const dbml = `
        Table users {
          id integer [pk]
          name varchar(255)
        }
      `;

      const result = parseDBML(dbml);
      
      expect(result).toBeDefined();
      expect(result.schema.tables).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle a complex schema with multiple features', () => {
      const dbml = `
        Table users {
          id integer [pk, increment]
          username varchar(50) [unique, not null]
          email varchar(255) [unique, not null]
          password_hash varchar(255) [not null]
          created_at timestamp [default: 'now()']
          updated_at timestamp [default: 'now()']
          Note: 'User accounts and authentication'
        }
        
        Table posts {
          id integer [pk, increment]
          user_id integer [not null, ref: > users.id]
          title varchar(255) [not null]
          content text
          published boolean [default: false]
          created_at timestamp [default: 'now()']
          updated_at timestamp [default: 'now()']
        }
        
        Table comments {
          id integer [pk, increment]
          post_id integer [not null]
          user_id integer [not null]
          content text [not null]
          created_at timestamp [default: 'now()']
        }
        
        Table tags {
          id integer [pk, increment]
          name varchar(50) [unique, not null]
          slug varchar(50) [unique, not null]
        }
        
        Table post_tags {
          post_id integer [not null]
          tag_id integer [not null]
        }
        
        Ref: comments.post_id > posts.id [delete: cascade]
        Ref: comments.user_id > users.id [delete: cascade]
        Ref: post_tags.post_id > posts.id [delete: cascade]
        Ref: post_tags.tag_id > tags.id [delete: cascade]
      `;

      const result = parser.parse(dbml);
      
      expect(result.errors).toHaveLength(0);
      expect(result.schema.tables).toHaveLength(5);
      expect(result.schema.references).toHaveLength(5); // 1 inline + 4 standalone
      
      // Check that all tables are properly positioned
      result.schema.tables.forEach(table => {
        expect(table.position.x).toBeGreaterThanOrEqual(0);
        expect(table.position.y).toBeGreaterThanOrEqual(0);
        expect(table.size.width).toBeGreaterThan(0);
        expect(table.size.height).toBeGreaterThan(0);
      });
      
      // Check that foreign key columns are marked
      const postsTable = result.schema.tables.find(t => t.name === 'posts');
      const userIdColumn = postsTable?.columns.find(c => c.name === 'user_id');
      expect(userIdColumn?.foreignKey).toBe(true);
    });
  });
});