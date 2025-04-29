
El apikey va en el header para todas las solicitudes:

X-Api-Key
tec_api_KdZRQLUyMEJJHDqztZilqg

________________________________________

POST https://www.aulify.mx/aulifyLogin
Autenticación de usuario
 
recibe email y password:
{
"email": "email@domain.com",
"password": "1234"
}
 
entrega token, email, nombre y nivel:
{
"token": "eyJhbGciOiJIUzI1NuJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3NDUxNjI3ODR9.8pETTDya_5QgxaaKGNg89uKKjRsfWZ3qUE5jwyAA0Is",
"email": "email@domain.com",
"name": "Nombre Alumno",
"level": "Cuarto Primaria"
}
 
Errores:
Credenciales inválidas:
{
"error": "Invalid email or password"
}
 
Usuario sin suscripción activa:
{
"error": "No active membership"
}
 
________________________________________
 
Los siguientes endpoints requieren el token de autenticación que también va en el header (Se sigue revisando el apikey también para estas solicitudes)
 
Authorization
Bearer [token del login]
________________________________________
 
POST https://www.aulify.mx/addCoins
Añadir monedas al usuario
 
recibe número de monedas:
{
"coins": 100
}
 
entrega número de monedas después de la operación:
{
"coins": 820
}
 
Errores:
Fallo al añadir monedas:
{
"error": "failed"
}
 
________________________________________
 
POST https://www.aulify.mx/spendCoins
Gasta monedas del usuario
 
recibe número de monedas:
{
"coins": 100
}
 
entrega número de monedas después de la operación:
{
"coins": 820
}
 
Errores:
Fallo al gastar monedas:
{
"error": "failed"
}
 
Monedas insuficientes:
{
"error": "Not enough coins"
}
 
________________________________________
 
GET https://www.aulify.mx/getCoins
Añadir monedas al usuario
 
No recibe ningún parámetro
 
entrega número de monedas:
{
"coins": 820
}
 
________________________________________
 
GET https://www.aulify.mx/getLastSticker
Añadir monedas al usuario
 
No recibe ningún parámetro
 
entrega último sticker conseguido por el usuario (id, nombre, descripción, días de racha para conseguir sticker, imagen):
{
"id": 1,
"name": "Racha 1",
"description": "¡Vas por muy buen camino!",
"sticker_days": 1,
"image": "https://aulifybucket.s3.us-east-2.amazonaws.com/iy45upehxjjdk8aln933ugn754fi?response-content-disposition=inline%3B%20filename%3D%22Pantallas%20rachas-08.png%22%3B%20filename%2A%3DUTF-8%27%27Pantallas%2520rachas-08.png&response-content-type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQNLAF6HR3LS6PC7V%2F20250413%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250413T154311Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=884d5cde2ce9416f55a58dae9f3a356001b0e7951eb1851f8a06e4916143902e"
}
 
Errores:
No ha conseguido ningún sticker:
{
"error": "No stickers found"
}
 
________________________________________
 
Error general para todos los endpoints:
{
"error": "Internal Server Error"
}
 
