//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vJAXB 2.1.10 in JDK 6 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2011.12.08 at 10:28:42 AM GMT+05:30 
//


package org.apache.airavat.oozie.coordinator;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for CONTROLS complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="CONTROLS">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence minOccurs="0">
 *         &lt;element name="timeout" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="concurrency" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="execution" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "CONTROLS", propOrder = {
    "timeout",
    "concurrency",
    "execution"
})
public class CONTROLS {

    protected String timeout;
    protected String concurrency;
    protected String execution;

    /**
     * Gets the value of the timeout property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getTimeout() {
        return timeout;
    }

    /**
     * Sets the value of the timeout property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setTimeout(String value) {
        this.timeout = value;
    }

    /**
     * Gets the value of the concurrency property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getConcurrency() {
        return concurrency;
    }

    /**
     * Sets the value of the concurrency property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setConcurrency(String value) {
        this.concurrency = value;
    }

    /**
     * Gets the value of the execution property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getExecution() {
        return execution;
    }

    /**
     * Sets the value of the execution property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setExecution(String value) {
        this.execution = value;
    }

}