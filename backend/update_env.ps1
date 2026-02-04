$content = Get-Content .env.example
$content = $content -replace 'MONGODB_URI=mongodb\+srv://username:password@cluster.mongodb.net/irrigation\?retryWrites=true&w=majority', 'MONGODB_URI=mongodb://localhost:27017'
$content = $content -replace 'SECRET_KEY=your-super-secret-jwt-key-change-this-in-production', 'SECRET_KEY=757bd66bb4ef16e77d520edf295f1f3ac494890000660575fdb1be5975f'
$content | Set-Content .env
