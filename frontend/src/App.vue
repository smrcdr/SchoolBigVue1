<template>
  <RouterView />
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}

.page {
  padding: 16px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  border: 1px solid #ccc;
  padding: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.muted {
  margin: 0;
  color: #666;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
}

input,
button {
  border: 1px solid #ccc;
  padding: 6px 8px;
  width: 100%;
}

button {
  width: auto;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin: 0;
  color: #146414;
}

.error {
  margin: 0;
  color: #b00020;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}

.auth-page {
  max-width: 420px;
  margin: 20px auto;
}
</style>
