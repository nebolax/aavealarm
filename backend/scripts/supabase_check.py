from supabase import create_client, Client


supabase: Client = create_client(
    'https://bectdkadeegvxebkqzmh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY3Rka2FkZWVndnhlYmtxem1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA1Nzc5NjcsImV4cCI6MjAwNjE1Mzk2N30.GuhQ56q0NVc_Ur3kSL7ApxQY-WMmVBAqxet7t2ZgqFM',
)
supabase.auth.sign_up({
    'email': '2b7fe6b7-13bd-46c9-8885-44d254bebc13@aavealarm.com',
    'password': 'aavealarm',
})
print('Signed up!')