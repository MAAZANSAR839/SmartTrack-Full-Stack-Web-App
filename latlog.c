#define BLYNK_TEMPLATE_ID "TMPL6VjJZfPWJ"
#define BLYNK_TEMPLATE_NAME "Project 2"
#define BLYNK_AUTH_TOKEN "67McLeNo02a93alU2c2N_OQDznB4U9gt"

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "iPhone";
char pass[] = "1234567890";

uint8_t volatile Temperature=0,Humidity=0;
uint8_t volatile Card_Status=0,Gyro_Status=0;
double volatile Longitude=0,Latitudeq   q=0;
char Card_Number[13]={'0','0','0','0','0','0','0','0','0','0','0','0','\0'};

BLYNK_WRITE(V6)
{
  Card_Status=param.asInt();
}
BLYNK_WRITE(V7)
{
  Card_Status=param.asInt()*2;
}

void setup() 
{
  Serial.begin(9600);
  Blynk.begin(auth, ssid, pass);
}

void loop()
{
  uint8_t volatile static count=0;
  if(Serial.available())
  {
    if(Serial.read()=='D')
    {
      delay(50);
      Latitude=float(((Serial.read()-'0')*1000)+((Serial.read()-'0')*100)+((Serial.read()-'0')*10)+((Serial.read()-'0')*1))/100.0;
      Longitude=float(((Serial.read()-'0')*1000)+((Serial.read()-'0')*100)+((Serial.read()-'0')*10)+((Serial.read()-'0')*1))/100.0;
      Humidity=((Serial.read()-'0')*100)+((Serial.read()-'0')*10)+((Serial.read()-'0')*1);
      Temperature=((Serial.read()-'0')*100)+((Serial.read()-'0')*10)+((Serial.read()-'0')*1);
      Gyro_Status=((Serial.read()-'0')*1);
      for(uint8_t i=0;i<12;i++)
      {
        Card_Number[i]=Serial.read(); 
      }
    }
    while(Serial.available()){Serial.read();}
  }
  Serial.print('D');Serial.println(Card_Status);
  
  Blynk.virtualWrite(V0,Latitude);
  Blynk.virtualWrite(V1,Longitude);
  Blynk.virtualWrite(V2,Humidity);
  Blynk.virtualWrite(V3,Temperature);
  Blynk.virtualWrite(V4,Gyro_Status);
  Blynk.virtualWrite(V5,Card_Number);
  Blynk.run();
  delay(200);
}