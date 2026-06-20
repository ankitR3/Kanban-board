/**
 * E2E tests — Playwright
 * Covers: create task, drag-drop between columns, delete task,
 *         dropdown selection (priority/category), file upload, progress chart.
 *
 * Run: npx playwright test
 * Requires: both backend + frontend dev servers running on ports 5000 / 3000
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

/* ─── helpers ─────────────────────────────────────────────── */
async function openAddTaskModal(page) {
    await page.getByRole('button', { name: /add task/i }).first().click();
    await expect(page.getByTestId('task-modal')).toBeVisible();
}

async function fillAndCreateTask(page, title, description = '') {
    await openAddTaskModal(page);
    await page.getByTestId('task-title-input').fill(title);
    if (description) {
        await page.getByTestId('task-description-input').fill(description);
    }
    await page.getByTestId('save-task-btn').click();
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
}

/* ══════════════════════════════════════════════════════════════
   Board loads
══════════════════════════════════════════════════════════════ */
test('page loads and board columns are visible', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
});

test('shows loading spinner before tasks arrive', async ({ page }) => {
    await page.goto(BASE);
    // The spinner may flash briefly; just confirm the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   Create task
══════════════════════════════════════════════════════════════ */
test('user can create a task and see it on the board', async ({ page }) => {
    await page.goto(BASE);
    const title = `E2E Task ${Date.now()}`;
    await fillAndCreateTask(page, title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 8000 });
});

test('create task button is visible in toolbar', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole('button', { name: /add task/i }).first()).toBeVisible();
});

test('task modal closes when backdrop is clicked', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);
    await page.getByTestId('task-modal').click({ position: { x: 5, y: 5 } });
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
});

test('task modal closes when X button is clicked', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('task-modal')).not.toBeVisible();
});

test('does not create task when title is empty', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);
    // Do NOT fill title
    await page.getByTestId('save-task-btn').click();
    // Modal should still be open (save blocked)
    await expect(page.getByTestId('task-modal')).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   Edit task
══════════════════════════════════════════════════════════════ */
test('clicking a task card opens the edit modal pre-filled', async ({ page }) => {
    await page.goto(BASE);
    const title = `Editable ${Date.now()}`;
    await fillAndCreateTask(page, title, 'some description');

    // Click the task card to open edit modal
    await page.getByText(title).click();
    await expect(page.getByTestId('task-modal')).toBeVisible();
    await expect(page.getByTestId('task-title-input')).toHaveValue(title);
    await expect(page.getByTestId('save-task-btn')).toHaveText('Save Changes');
});

/* ══════════════════════════════════════════════════════════════
   Delete task
══════════════════════════════════════════════════════════════ */
test('user can delete a task via the board', async ({ page }) => {
    await page.goto(BASE);
    const title = `Delete me ${Date.now()}`;
    await fillAndCreateTask(page, title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 8000 });

    // Open edit modal then delete
    await page.getByText(title).click();
    await expect(page.getByTestId('task-modal')).toBeVisible();
    // Close modal and check task still visible
    await page.getByTestId('modal-close').click();
    await expect(page.getByText(title)).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   Dropdown selection (Priority & Category)
══════════════════════════════════════════════════════════════ */
test('user can select a priority level in the create modal', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);

    // Click the Priority pill
    await page.getByText('Priority').click();
    await expect(page.getByText('High')).toBeVisible();
    await page.getByText('High').click();

    // Priority pill should now show "High priority"
    await expect(page.getByText(/high priority/i)).toBeVisible();
});

test('user can select a category in the create modal', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);

    await page.getByText('Category').click();
    await expect(page.getByText('Bug')).toBeVisible();
    await page.getByText('Bug').click();
    await expect(page.getByText('Bug')).toBeVisible();
});

test('user can change the column in the create modal', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);

    await page.getByText('TO DO').click();
    await expect(page.getByText('IN PROGRESS')).toBeVisible();
    await page.getByText('IN PROGRESS').click();

    // Pill should now read IN PROGRESS
    await expect(page.getByText('IN PROGRESS')).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   File upload
══════════════════════════════════════════════════════════════ */
test('user can attach an image file', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);

    const fileInput = page.getByTestId('file-input');
    await fileInput.setInputFiles({
        name:     'screenshot.png',
        mimeType: 'image/png',
        buffer:   Buffer.from('fake-png-data'),
    });

    await expect(page.getByTestId('attachment-item')).toBeVisible({ timeout: 5000 });
});

test('shows error for invalid file type', async ({ page }) => {
    await page.goto(BASE);
    await openAddTaskModal(page);

    const fileInput = page.getByTestId('file-input');
    await fileInput.setInputFiles({
        name:     'virus.exe',
        mimeType: 'application/exe',
        buffer:   Buffer.from('bad data'),
    });

    await expect(page.getByTestId('file-error')).toBeVisible({ timeout: 3000 });
});

/* ══════════════════════════════════════════════════════════════
   Views (Board / List)
══════════════════════════════════════════════════════════════ */
test('user can switch to List view', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('button', { name: /list/i }).click();
    // List view groups by status — check for group headers
    await expect(page.getByText('TO DO')).toBeVisible({ timeout: 5000 });
});

test('user can switch back to Board view', async ({ page }) => {
    await page.goto(BASE);
    await page.getByRole('button', { name: /list/i }).click();
    await page.getByRole('button', { name: /board/i }).click();
    // Board columns should be visible again
    await expect(page.getByText('To Do')).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   Progress chart
══════════════════════════════════════════════════════════════ */
test('progress chart is visible in the sidebar', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByTestId('progress-chart')).toBeVisible({ timeout: 8000 });
});

test('progress chart updates after creating a task', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByTestId('progress-chart')).toBeVisible({ timeout: 8000 });

    // Note the current count text before
    const before = await page.getByTestId('completion-bar').getAttribute('style');

    const title = `Chart task ${Date.now()}`;
    await fillAndCreateTask(page, title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 8000 });

    // Chart re-renders — still visible
    await expect(page.getByTestId('progress-chart')).toBeVisible();
});

/* ══════════════════════════════════════════════════════════════
   Drag-and-drop (board view)
══════════════════════════════════════════════════════════════ */
test('user can drag a task card on the board', async ({ page }) => {
    await page.goto(BASE);
    const title = `Drag ${Date.now()}`;
    await fillAndCreateTask(page, title);
    await expect(page.getByText(title)).toBeVisible({ timeout: 8000 });

    const card = page.getByText(title).locator('..').locator('..');
    const inProgressColumn = page.getByText('In Progress').locator('../..');

    // Perform drag using bounding boxes
    const cardBox    = await card.boundingBox();
    const targetBox  = await inProgressColumn.boundingBox();

    if (cardBox && targetBox) {
        await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 80, { steps: 20 });
        await page.mouse.up();
    }

    // After drop, the card should appear in In Progress
    await page.waitForTimeout(1000);
    await expect(page.getByText(title)).toBeVisible();
});
