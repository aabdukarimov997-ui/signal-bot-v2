// JavaScript for TraderPro Trading Platform

document.addEventListener('DOMContentLoaded', function() {
    // Mobile sidebar toggle
    const sidebarToggleBtn = document.querySelector('#sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 767.98) {
            if (!sidebar.contains(event.target) && !sidebarToggleBtn.contains(event.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('active');
            }
        }
    });
    
    // Adjust sidebar on resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 767.98) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('active');
        }
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
    
    // Example: Auto-refresh market data every 30 seconds
    setInterval(function() {
        // In a real application, you would fetch new data from an API
        console.log('Refreshing market data...');
        // For demo, we'll just update a timestamp
        const timestampElement = document.getElementById('last-update');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleTimeString();
        }
    }, 30000);
    
    // Example: Handle form submission for new order
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const symbol = document.getElementById('symbol').value;
            const type = document.getElementById('type').value;
            const side = document.getElementById('side').value;
            const amount = document.getElementById('amount').value;
            const price = document.getElementById('price').value;
            
            // Basic validation
            if (!amount || (type !== 'market' && !price)) {
                alert('Iltimos, majburiy maydonlarni to\'ldiring!');
                return;
            }
            
            // In a real app, you would send this data to your backend
            console.log('Order submitted:', { symbol, type, side, amount, price });
            
            // Show success message
            alert('Buyurtma muvaffaqiyatli yuborildi!');
            
            // Reset form
            orderForm.reset();
            document.getElementById('symbol').value = 'BTC/USD'; // Reset to default
        });
    }
    
    // Example: Toggle dark/light mode (if implemented)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            // Save preference to localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i> Yorqin rejim';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i> Qorong\'i rejim';
            }
        });
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Yorqin rejim';
        }
    }
    
    // Example: Simple animation for price changes
    function animatePriceChange(element, newValue, isIncrease) {
        element.textContent = newValue;
        element.classList.remove('animate-price-up', 'animate-price-down');
        void element.offsetWidth; // Trigger reflow
        element.classList.add(isIncrease ? 'animate-price-up' : 'animate-price-down');
    }
    
    // Add CSS animations for price changes (would normally be in CSS)
    const style = document.createElement('style');
    style.textContent = `
        .animate-price-up {
            animation: priceUp 0.5s ease-out;
        }
        .animate-price-down {
            animation: priceDown 0.5s ease-out;
        }
        @keyframes priceUp {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); color: #198754; }
            100% { transform: scale(1); }
        }
        @keyframes priceDown {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); color: #dc3545; }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});