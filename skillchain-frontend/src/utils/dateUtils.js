export function formatDate(iso){ try{ const d = new Date(iso); return d.toLocaleDateString() }catch(e){ return iso } }
