<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of utilities
 *
 * @author fpiraneo
 */

namespace OCA\OCLife;

class utilities {
    /**
     * Format a file size in human readable form
     * @param integer $bytes File size in bytes
     * @param integer $precision Decimal digits (default: 2)
     * @return string
     */
    public static function formatBytes($bytes, $precision = 2, $addOriginal = FALSE) { 
        $units = array('B', 'KB', 'MB', 'GB', 'TB'); 

        $dimension = max($bytes, 0); 
        $pow = floor(($dimension ? log($bytes) : 0) / log(1024)); 
        $pow = min($pow, count($units) - 1); 

        $dimension /= pow(1024, $pow);
        // $bytes /= (1 << (10 * $pow)); 

        $result = round($dimension, $precision) . ' ' . $units[$pow];
        
        if($addOriginal === TRUE) {
            $result .= sprintf(" (%s bytes)", number_format($bytes));
        }
        
        return $result;
    } 
}