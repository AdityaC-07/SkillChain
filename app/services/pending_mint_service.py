"""Background service to retry pending certificate mints."""

import asyncio
from logging import getLogger

from app.models.certificate import Certificate
from app.services import blockchain_service

logger = getLogger("skillchain.pending_mint")


async def retry_pending_mints():
    """Retry minting certificates that are in PENDING_MINT status.
    
    This function is called periodically by a background task.
    It will retry up to 3 times for each certificate.
    """
    try:
        # Find all certificates in PENDING_MINT status with retry_count < 3
        pending_certs = await Certificate.find(
            Certificate.status == "PENDING_MINT",
            Certificate.retry_count < 3
        ).to_list()
        
        if not pending_certs:
            return
        
        logger.info(f"Found {len(pending_certs)} pending certificates to retry")
        
        for cert in pending_certs:
            try:
                # Attempt to mint the certificate
                if cert.metadata_ipfs_url and cert.learner_wallet:
                    minted = await blockchain_service.mint_certificate(
                        cert.learner_wallet,
                        cert.metadata_ipfs_url
                    )
                    
                    # Update certificate with mint details
                    cert.token_id = int(minted.get("token_id")) if minted.get("token_id") else None
                    cert.tx_hash = minted.get("tx_hash")
                    cert.status = "ACTIVE"
                    await cert.save()
                    
                    logger.info(f"Successfully minted certificate {cert.certificate_id} on retry {cert.retry_count + 1}")
                else:
                    # Increment retry count if missing required data
                    cert.retry_count += 1
                    await cert.save()
                    logger.warning(f"Certificate {cert.certificate_id} missing required data for mint, retry count: {cert.retry_count}")
                    
            except Exception as e:
                # Increment retry count on failure
                cert.retry_count += 1
                await cert.save()
                logger.error(f"Failed to mint certificate {cert.certificate_id} on retry {cert.retry_count}: {e}")
                
                # If max retries reached, mark as failed (could add a FAILED status if needed)
                if cert.retry_count >= 3:
                    logger.error(f"Certificate {cert.certificate_id} reached max retry attempts, giving up")
                    
    except Exception as e:
        logger.error(f"Error in retry_pending_mints: {e}")


async def start_pending_mint_scheduler():
    """Start the background task to retry pending mints every 60 seconds."""
    while True:
        try:
            await retry_pending_mints()
        except Exception as e:
            logger.error(f"Error in pending mint scheduler: {e}")
        await asyncio.sleep(60)
