$b1 = @{ 
    user_name="Test User 1"
    user_email="test1@example.com"
    device_id=1
    start_date="2026-06-20"
    end_date="2026-06-25"
    quantity=8
    delivery_option="Pickup" 
}
$json1 = $b1 | ConvertTo-Json
$r1 = Invoke-RestMethod -Uri http://localhost:5000/api/bookings -Method Post -Body $json1 -ContentType "application/json"
Write-Host "Booking 1: $($r1.message)"

$b2 = @{ 
    user_name="Test User 2"
    user_email="test2@example.com"
    device_id=1
    start_date="2026-06-22"
    end_date="2026-06-23"
    quantity=3
    delivery_option="Delivery" 
}
$json2 = $b2 | ConvertTo-Json
try { 
    Invoke-RestMethod -Uri http://localhost:5000/api/bookings -Method Post -Body $json2 -ContentType "application/json" 
} catch { 
    Write-Host "Booking 2 (Overlapping): $($_.Exception.Message)" 
}

$b3 = @{ 
    user_name="Test User 3"
    user_email="test3@example.com"
    device_id=1
    start_date="2026-06-26"
    end_date="2026-06-27"
    quantity=5
    delivery_option="Pickup" 
}
$json3 = $b3 | ConvertTo-Json
$r3 = Invoke-RestMethod -Uri http://localhost:5000/api/bookings -Method Post -Body $json3 -ContentType "application/json"
Write-Host "Booking 3: $($r3.message)"
