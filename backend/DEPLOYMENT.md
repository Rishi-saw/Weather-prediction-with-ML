# Deployment Guide

Complete guide for deploying the Weather Prediction API to various platforms.

## 🚀 Local Development

### Run Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Train models (if needed)
python train_models.py --csv Kolkata.csv

# Start server
python main.py
```

Access at: http://localhost:8000

---

## ☁️ Cloud Deployment Options

### 1. Render (Recommended - Easiest)

**Why Render?**
- Free tier available
- Automatic deployments from GitHub
- Built-in SSL
- Simple configuration

**Steps:**

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/weather-prediction-api.git
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to https://render.com
   - Sign up with GitHub
   - Click "New" → "Web Service"
   - Connect your repository
   - Render will auto-detect `render.yaml`

3. **Deploy**
   - Click "Create Web Service"
   - Wait for build (5-10 minutes first time)
   - Access your API at: https://your-app-name.onrender.com

**Note:** Free tier may spin down after inactivity. First request after idle takes ~30 seconds.

---

### 2. Railway

**Why Railway?**
- Simple deployment
- Free $5 monthly credit
- Automatic HTTPS
- Good for hobby projects

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Set Start Command**
   In Railway dashboard:
   - Go to your service
   - Settings → Deploy
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Generate Domain**
   - Settings → Networking
   - Generate Domain
   - Access your API

---

### 3. Heroku

**Steps:**

1. **Install Heroku CLI**
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Scale**
   ```bash
   heroku ps:scale web=1
   ```

**Note:** Heroku no longer has a free tier. Minimum $7/month.

---

### 4. DigitalOcean App Platform

**Steps:**

1. Push code to GitHub

2. Go to https://cloud.digitalocean.com/apps

3. Create App → Connect GitHub repository

4. Configure:
   - **Build Command**: `pip install -r requirements.txt && python train_models.py --csv Kolkata.csv`
   - **Run Command**: `uvicorn main:app --host 0.0.0.0 --port 8080`
   - **HTTP Port**: 8080

5. Deploy

**Cost:** Starting at $5/month

---

### 5. AWS (EC2 + Nginx)

**For Production Apps with High Traffic**

**Steps:**

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier eligible)
   - Open ports 22, 80, 443

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python 3.11
   sudo apt install python3.11 python3.11-venv python3-pip -y
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Clone repository
   git clone https://github.com/yourusername/weather-prediction-api.git
   cd weather-prediction-api
   
   # Create virtual environment
   python3.11 -m venv venv
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Train models
   python train_models.py --csv Kolkata.csv
   ```

4. **Setup Systemd Service**
   
   Create `/etc/systemd/system/weather-api.service`:
   ```ini
   [Unit]
   Description=Weather Prediction API
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/weather-prediction-api
   Environment="PATH=/home/ubuntu/weather-prediction-api/venv/bin"
   ExecStart=/home/ubuntu/weather-prediction-api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

5. **Configure Nginx**
   
   Create `/etc/nginx/sites-available/weather-api`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Enable and Start**
   ```bash
   sudo ln -s /etc/nginx/sites-available/weather-api /etc/nginx/sites-enabled/
   sudo systemctl enable weather-api
   sudo systemctl start weather-api
   sudo systemctl restart nginx
   ```

7. **SSL with Let's Encrypt** (Optional)
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔧 Environment Configuration

### For PostgreSQL (Production)

1. **Update database.py**:
   ```python
   import os
   SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./predictions.db")
   ```

2. **Set Environment Variable**:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

### For Custom Port

Set `PORT` environment variable:
```bash
export PORT=8080
```

---

## 📊 Post-Deployment Checks

### 1. Health Check
```bash
curl https://your-api-url.com/health
```

Should return:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "database": "connected"
}
```

### 2. Test Prediction
```bash
curl -X POST https://your-api-url.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "humidity": 75.0,
    "pressure": 1010.0,
    "wind_speed": 15.0,
    "clouds": 60.0,
    "month": 7,
    "day": 15
  }'
```

### 3. Check Documentation
Visit: `https://your-api-url.com/docs`

---

## 🐛 Troubleshooting

### Models Not Loading
- Ensure `.pkl` files are in the same directory as `main.py`
- Check file permissions
- Verify scikit-learn version matches training version

### Port Already in Use
```bash
# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Database Connection Error
- Check `predictions.db` file exists
- Verify write permissions
- For PostgreSQL, check DATABASE_URL

### CORS Issues
Update `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔐 Security Best Practices

1. **Use HTTPS** (automatic on Render/Railway)
2. **Set CORS origins** to specific domains in production
3. **Use PostgreSQL** instead of SQLite for production
4. **Add rate limiting** for API endpoints
5. **Use environment variables** for sensitive config
6. **Keep dependencies updated**: `pip install --upgrade -r requirements.txt`

---

## 📈 Monitoring

### Render
- Built-in metrics dashboard
- Automatic log aggregation
- Health check monitoring

### Custom Monitoring
Add to `main.py`:
```python
from prometheus_client import Counter, generate_latest

prediction_counter = Counter('predictions_total', 'Total predictions')

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Render | 750 hrs/mo | $7/mo | Hobby projects |
| Railway | $5 credit/mo | Pay-as-you-go | Quick deployment |
| Heroku | None | $7/mo minimum | Established apps |
| DigitalOcean | None | $5/mo | Startups |
| AWS EC2 | 750 hrs/mo (1 yr) | $3.50+/mo | Production apps |

---

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review API logs
3. Test locally first
4. Open GitHub issue

---

**🎉 Your Weather Prediction API is ready for the world!**
