CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  category_id TEXT,
  image_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
