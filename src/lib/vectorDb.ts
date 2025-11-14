import { supabase } from './supabase'

export async function createVectorTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE EXTENSION IF NOT EXISTS vector;
      
      CREATE TABLE IF NOT EXISTS dataset_embeddings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        dataset_id UUID REFERENCES datasets NOT NULL,
        row_index INT NOT NULL,
        embedding vector(384),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS dataset_embeddings_vector_idx 
      ON dataset_embeddings USING ivfflat (embedding vector_cosine_ops);
    `
  })
  return { error }
}

export async function searchSimilarData(datasetId: string, queryEmbedding: number[], limit: number = 10) {
  const { data, error } = await supabase.rpc('search_similar_rows', {
    dataset_id: datasetId,
    query_embedding: queryEmbedding,
    match_limit: limit
  })
  return { data, error }
}

export function generateSimpleEmbedding(text: string): number[] {
  const embedding = new Array(384).fill(0)
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    embedding[i % 384] += charCode / 1000
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}
