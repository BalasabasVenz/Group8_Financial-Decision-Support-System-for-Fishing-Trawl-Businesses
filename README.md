composer install
npm.cmd install
copy .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
npm.cmd run build
php artisan serve
php artisan storage:link
