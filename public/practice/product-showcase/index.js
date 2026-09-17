"use strict";
class Collection {
    constructor(items) {
        this.items = items;
    }
    getAll() {
        return this.items;
    }
    filter(callback) {
        return this.items.filter(callback);
    }
}
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function renderProduct(product) {
    let title;
    let details;
    switch (product.type) {
        case 'book':
            title = product.title;
            details = `Book: ${product.title} by ${product.author}`;
            break;
        case 'electronics':
            title = product.item;
            details = `Electronics: ${product.item} - ${product.model}`;
            if (product.warranty !== undefined) {
                details += ` - Warranty: ${product.warranty} year(s)`;
            }
            break;
        case 'clothing':
            title = product.item;
            details = `Clothing: ${product.item} by ${product.brand}`;
            if (product.size !== undefined) {
                details += ` - Size ${product.size}`;
            }
            break;
        default:
            throw new Error(`Unknown product type: ${JSON.stringify(product)}`);
    }
    return `
    <article class="item" id="${escapeHtml(product.id)}" data-category="${product.type}">
      <div class="item-topline">
        <span class="category">${product.type === 'book' ? 'Books' : product.type === 'electronics' ? 'Electronics' : 'Clothing'}</span>
        <span class="item-mark" aria-hidden="true">${product.type === 'book' ? '01' : product.type === 'electronics' ? '02' : '03'}</span>
      </div>
      <h2>${escapeHtml(title)}</h2>
      <p class="description">${escapeHtml(details)}</p>
      <div class="item-footer">
        <span class="price-label">Price</span>
        <p class="price">${escapeHtml(product.price)}</p>
      </div>
    </article>`;
}
const products = new Collection([
    { type: 'book', id: 'book-1', title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 16.99 },
    { type: 'book', id: 'book-2', title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', price: 14.5 },
    { type: 'electronics', id: 'electronics-1', item: 'Headphones', model: 'Ember Studio', warranty: 2, price: 129.99 },
    { type: 'electronics', id: 'electronics-2', item: 'Desk Speaker', model: 'Warmtone Mini', price: 79 },
    { type: 'clothing', id: 'clothing-1', item: 'Overshirt', brand: 'North Thread', size: 'M', price: 59.99 },
    { type: 'clothing', id: 'clothing-2', item: 'Canvas Cap', brand: 'Field Notes', price: 24 },
]);
function showProducts(filter) {
    const output = document.getElementById('output');
    if (!output)
        return;
    const selected = filter === undefined
        ? products.getAll()
        : products.filter(product => product.type === filter);
    output.innerHTML = selected.map(renderProduct).join('');
    const activeId = filter === undefined ? 'all' : filter === 'book' ? 'books' : filter;
    for (const id of ['all', 'books', 'electronics', 'clothing']) {
        document.getElementById(id)?.setAttribute('aria-pressed', String(id === activeId));
    }
}
function initializeShowcase() {
    const filters = [
        ['all', undefined], ['books', 'book'], ['electronics', 'electronics'], ['clothing', 'clothing'],
    ];
    for (const [id, filter] of filters) {
        const button = document.getElementById(id);
        if (button)
            button.onclick = () => showProducts(filter);
    }
    showProducts();
}
document.addEventListener('DOMContentLoaded', initializeShowcase);
if (document.readyState !== 'loading')
    initializeShowcase();
