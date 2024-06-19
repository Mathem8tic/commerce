import redis

# Replace "redis" and 6379 with your Redis host and port if different
redis_host = "redis"
redis_port = 6379

try:
    r = redis.StrictRedis(host=redis_host, port=redis_port, decode_responses=True)
    r.ping()
    print("Connected to Redis")
except Exception as e:
    print(f"Failed to connect to Redis: {e}")
