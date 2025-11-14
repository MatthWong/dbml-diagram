import { DBMLGenerator, generateDBML, validateRoundTrip } from '../dbmlGenerator';
import { DatabaseSchema, Table, Column, Reference } from '../../types/database';
import { DEFAULT_DATABASE_SCHEMA } from '../../constants/defaults';

describe('DBMLGenerator', () => {
  let generator: DBMLGenerator;

  beforeEach(() => {
    generator = new DBMLGenerator();
  });

  describe('Basic table generation', () => {
    it('should generate a simple table', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            },
            {
              id: 'col_2',
              name: 'name',
              type: 'varchar(255)',
              notNull: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table users {');
      expect(result.dbml).toContain('id integer [pk]');
      expect(result.dbml).toContain('name varchar(255) [not null]');
      expect(result.metadata.tablesGenerated).toBe(1);
    });

    it('should generate table with schema prefix', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          schema: 'public',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table public.users {');
    });

    it('should generate table with note', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          note: 'User accounts table',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain("Note: 'User accounts table'");
    });
  });

  describe('Column generation', () => {
    it('should generate columns with various constraints', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'products',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            },
            {
              id: 'col_2',
              name: 'name',
              type: 'varchar(255)',
              notNull: true,
              unique: true
            },
            {
              id: 'col_3',
              name: 'price',
              type: 'decimal(10,2)',
              default: '0.00'
            },
            {
              id: 'col_4',
              name: 'description',
              type: 'text',
              note: 'Product description'
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('id integer [pk]');
      expect(result.dbml).toContain('name varchar(255) [not null, unique]');
      expect(result.dbml).toContain("price decimal(10,2) [default: '0.00']");
      expect(result.dbml).toContain("description text [note: 'Product description']");
    });

    it('should handle different default value types', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'test_table',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              default: '1'
            },
            {
              id: 'col_2',
              name: 'name',
              type: 'varchar(255)',
              default: 'unnamed'
            },
            {
              id: 'col_3',
              name: 'created_at',
              type: 'timestamp',
              default: 'now()'
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('id integer [default: 1]');
      expect(result.dbml).toContain("name varchar(255) [default: 'unnamed']");
      expect(result.dbml).toContain("created_at timestamp [default: 'now()']");
    });
  });

  describe('Reference generation', () => {
    it('should generate standalone references', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            columns: [
              {
                id: 'col_1',
                name: 'id',
                type: 'integer',
                primaryKey: true
              }
            ],
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          },
          {
            id: 'table_2',
            name: 'posts',
            columns: [
              {
                id: 'col_2',
                name: 'id',
                type: 'integer',
                primaryKey: true
              },
              {
                id: 'col_3',
                name: 'user_id',
                type: 'integer'
              }
            ],
            position: { x: 400, y: 100 },
            size: { width: 200, height: 150 }
          }
        ],
        references: [
          {
            id: 'ref_1',
            fromTable: 'posts',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'one-to-many'
          }
        ]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Ref: posts.user_id > users.id');
      expect(result.metadata.referencesGenerated).toBe(1);
    });

    it('should generate different relationship types', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            columns: [{ id: 'col_1', name: 'id', type: 'integer', primaryKey: true }],
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          },
          {
            id: 'table_2',
            name: 'profiles',
            columns: [{ id: 'col_2', name: 'user_id', type: 'integer' }],
            position: { x: 400, y: 100 },
            size: { width: 200, height: 150 }
          }
        ],
        references: [
          {
            id: 'ref_1',
            fromTable: 'profiles',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'one-to-one'
          },
          {
            id: 'ref_2',
            fromTable: 'profiles',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'many-to-one'
          },
          {
            id: 'ref_3',
            fromTable: 'profiles',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'many-to-many'
          }
        ]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('profiles.user_id - users.id'); // one-to-one
      expect(result.dbml).toContain('profiles.user_id < users.id'); // many-to-one
      expect(result.dbml).toContain('profiles.user_id <> users.id'); // many-to-many
    });

    it('should generate reference constraints', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            columns: [{ id: 'col_1', name: 'id', type: 'integer', primaryKey: true }],
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          },
          {
            id: 'table_2',
            name: 'posts',
            columns: [{ id: 'col_2', name: 'user_id', type: 'integer' }],
            position: { x: 400, y: 100 },
            size: { width: 200, height: 150 }
          }
        ],
        references: [
          {
            id: 'ref_1',
            name: 'user_posts',
            fromTable: 'posts',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'one-to-many',
            onDelete: 'cascade',
            onUpdate: 'restrict'
          }
        ]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Ref user_posts: posts.user_id > users.id [delete: cascade, update: restrict]');
    });
  });

  describe('Generation options', () => {
    it('should respect includeComments option', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          note: 'User table',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const generatorWithoutComments = new DBMLGenerator({ includeComments: false });
      const result = generatorWithoutComments.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).not.toContain('//');
      expect(result.dbml).not.toContain('Note:');
    });

    it('should respect includeMetadata option', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const generatorWithoutMetadata = new DBMLGenerator({ includeMetadata: false });
      const result = generatorWithoutMetadata.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).not.toContain('Generated on:');
      expect(result.dbml).not.toContain('Schema Statistics:');
    });

    it('should respect custom indent size', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const generatorWithCustomIndent = new DBMLGenerator({ indentSize: 4 });
      const result = generatorWithCustomIndent.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('    id integer [pk]'); // 4 spaces
    });
  });

  describe('Error handling', () => {
    it('should handle empty schema', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [],
        references: []
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.metadata.tablesGenerated).toBe(0);
      expect(result.metadata.referencesGenerated).toBe(0);
    });

    it('should handle tables with no columns', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'empty_table',
          columns: [],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table empty_table {');
      expect(result.dbml).toContain('}');
    });
  });

  describe('String escaping', () => {
    it('should properly escape strings with quotes', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          note: "User's table with \"quotes\"",
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            },
            {
              id: 'col_2',
              name: 'description',
              type: 'text',
              note: "Column with 'single' and \"double\" quotes"
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain("User\\'s table with \\\"quotes\\\"");
      expect(result.dbml).toContain("Column with \\'single\\' and \\\"double\\\" quotes");
    });
  });

  describe('Convenience functions', () => {
    it('should work with static generateDBML method', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = DBMLGenerator.generateDBML(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table users {');
    });

    it('should work with convenience function', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [{
          id: 'table_1',
          name: 'users',
          columns: [
            {
              id: 'col_1',
              name: 'id',
              type: 'integer',
              primaryKey: true
            }
          ],
          position: { x: 100, y: 100 },
          size: { width: 200, height: 150 }
        }]
      };

      const result = generateDBML(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table users {');
    });
  });

  describe('Round-trip validation', () => {
    it('should validate successful round-trip', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            columns: [
              {
                id: 'col_1',
                name: 'id',
                type: 'integer',
                primaryKey: true
              },
              {
                id: 'col_2',
                name: 'name',
                type: 'varchar(255)',
                notNull: true
              }
            ],
            position: { x: 100, y: 100 },
            size: { width: 200, height: 150 }
          },
          {
            id: 'table_2',
            name: 'posts',
            columns: [
              {
                id: 'col_3',
                name: 'id',
                type: 'integer',
                primaryKey: true
              },
              {
                id: 'col_4',
                name: 'user_id',
                type: 'integer'
              }
            ],
            position: { x: 400, y: 100 },
            size: { width: 200, height: 150 }
          }
        ],
        references: [
          {
            id: 'ref_1',
            fromTable: 'posts',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'one-to-many'
          }
        ]
      };

      const validation = validateRoundTrip(schema);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.generatedDbml).toBeDefined();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle a complex schema with all features', () => {
      const schema: DatabaseSchema = {
        ...DEFAULT_DATABASE_SCHEMA,
        tables: [
          {
            id: 'table_1',
            name: 'users',
            schema: 'public',
            note: 'User accounts table',
            columns: [
              {
                id: 'col_1',
                name: 'id',
                type: 'integer',
                primaryKey: true
              },
              {
                id: 'col_2',
                name: 'username',
                type: 'varchar(50)',
                unique: true,
                notNull: true
              },
              {
                id: 'col_3',
                name: 'email',
                type: 'varchar(255)',
                unique: true,
                notNull: true
              },
              {
                id: 'col_4',
                name: 'created_at',
                type: 'timestamp',
                default: 'now()',
                note: 'Account creation timestamp'
              }
            ],
            position: { x: 100, y: 100 },
            size: { width: 250, height: 200 },
            color: '#e3f2fd'
          },
          {
            id: 'table_2',
            name: 'posts',
            columns: [
              {
                id: 'col_5',
                name: 'id',
                type: 'integer',
                primaryKey: true
              },
              {
                id: 'col_6',
                name: 'user_id',
                type: 'integer',
                notNull: true,
                foreignKey: true
              },
              {
                id: 'col_7',
                name: 'title',
                type: 'varchar(255)',
                notNull: true
              },
              {
                id: 'col_8',
                name: 'content',
                type: 'text'
              },
              {
                id: 'col_9',
                name: 'published',
                type: 'boolean',
                default: 'false'
              }
            ],
            position: { x: 400, y: 100 },
            size: { width: 250, height: 200 }
          }
        ],
        references: [
          {
            id: 'ref_1',
            name: 'user_posts',
            fromTable: 'posts',
            fromColumn: 'user_id',
            toTable: 'users',
            toColumn: 'id',
            type: 'one-to-many',
            onDelete: 'cascade',
            onUpdate: 'restrict'
          }
        ]
      };

      const result = generator.generate(schema);

      expect(result.success).toBe(true);
      expect(result.dbml).toContain('Table public.users');
      expect(result.dbml).toContain("Note: 'User accounts table'");
      expect(result.dbml).toContain('username varchar(50) [unique, not null]');
      expect(result.dbml).toContain("created_at timestamp [default: 'now()', note: 'Account creation timestamp']");
      expect(result.dbml).toContain('Ref user_posts: posts.user_id > users.id [delete: cascade, update: restrict]');
      expect(result.metadata.tablesGenerated).toBe(2);
      expect(result.metadata.referencesGenerated).toBe(1);
    });
  });
});