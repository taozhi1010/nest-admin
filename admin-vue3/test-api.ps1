$body = @{
    userId = 112
    deptId = 100
    userName = "123123123"
    nickName = "3"
    password = ""
    phonenumber = "18651865081"
    email = "1076535690@qq.com"
    sex = "1"
    status = "0"
    remark = "12312"
    postIds = @(1,2,3,4)
    roleIds = @()
} | ConvertTo-Json

$token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMzA2MzIzMmIzYmFiNDlkNmI0MzFhMmQxZDcxMmI0ZTciLCJ1c2VySWQiOjEsImlhdCI6MTc3NTEzNDgxMH0.f8mhFTHdmSBsDWRZcKJjYM-xmdMMiwbSyDqba_3GiDA"

Write-Host "发送请求..."
Write-Host "请求数据：$body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/system/user" -Method PUT -Body $body -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = $token
    } -UseBasicParsing
    Write-Host "状态码：$($response.StatusCode)" -ForegroundColor Green
    Write-Host "响应内容：$($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "请求失败：$_" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "状态码：$($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情：$responseBody" -ForegroundColor Red
    }
}
