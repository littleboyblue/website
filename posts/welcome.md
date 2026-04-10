# Welcome to My Blog

Hello! This is my personal blog built with simple static HTML, JavaScript, and Markdown.

## How to Add New Posts

### Step 1: Create Markdown file

Add a new Markdown file in the `posts/` directory, for example `posts/my-new-post.md`:

```markdown
# My New Post

This is the content of my new post.

- You can use bullet points
- **Bold text** and *italic text*
- [Links](https://www.example.com) work too!

## Code Example

```javascript
function helloWorld() {
    console.log("Hello, world!");
}
```

That's it!
```

### Step 2: Update blog configuration

Edit the `blogConfig` object in `index.html` (around line 175) and add your new post:

```javascript
const blogConfig = {
    title: 'My Blog',
    description: 'Thinking, learning, and sharing',
    posts: [
        {
            id: 'welcome',
            title: 'Welcome to My Blog',
            date: 'April 10, 2026',
            excerpt: 'This is my personal blog...',
            file: 'posts/welcome.md'
        },
        // Add your new post here:
        {
            id: 'my-new-post',
            title: 'My New Post Title',
            date: 'April 10, 2026',
            excerpt: 'Short description of your post',
            file: 'posts/my-new-post.md'
        }
    ]
};
```

### Step 3: Deploy

Commit and push to GitHub:

```bash
git add .
git commit -m "Add new post"
git push origin main
```

GitHub Pages will automatically deploy your new post within a minute.

## Features

- ✅ **No build step needed** - Edit Markdown files, commit, and you're done
- ✅ **Markdown rendering with code highlighting**
- ✅ **Clean minimalist design**
- ✅ **Mobile responsive**
- ✅ **Works perfectly with GitHub Pages and custom domain**
- ✅ **All content is static, fast loading**

## Markdown Tips

You can use all standard Markdown features:

### Headers

# H1
## H2
### H3

### Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Code blocks

```python
def hello():
    print("Hello, Markdown!")
```

### Quotes

> This is a blockquote. It's great for highlighting text.

### Tables

| Name  | Age | City  |
|-------|-----|-------|
| Alice | 25  | Beijing |
| Bob   | 30  | Shanghai |

Enjoy blogging! 🎉
